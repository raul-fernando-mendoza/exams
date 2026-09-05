//
//  EvaluatorSelectionViewController.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible evaluator selection screen
//

import UIKit
import CoreData

class EvaluatorSelectionViewController: UIViewController {

    // MARK: - UI Components

    private let tableView: UITableView = {
        let table = UITableView(frame: .zero, style: .plain)
        table.translatesAutoresizingMaskIntoConstraints = false
        table.register(UITableViewCell.self, forCellReuseIdentifier: "EvaluatorCell")
        return table
    }()

    private let activityIndicator: UIActivityIndicatorView = {
        let indicator: UIActivityIndicatorView
        if #available(iOS 13.0, *) {
            indicator = UIActivityIndicatorView(style: .large)
        } else {
            indicator = UIActivityIndicatorView(style: .whiteLarge)
            indicator.color = .gray
        }
        indicator.translatesAutoresizingMaskIntoConstraints = false
        indicator.hidesWhenStopped = true
        return indicator
    }()

    private let statusLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.textAlignment = .center
        label.textColor = .gray
        label.numberOfLines = 0
        label.font = UIFont.systemFont(ofSize: 19)
        return label
    }()

    private let errorLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.textAlignment = .center
        label.textColor = .red
        label.numberOfLines = 0
        label.font = UIFont.systemFont(ofSize: 16)
        label.isHidden = true
        return label
    }()

    private let retryButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Retry", for: .normal)
        button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 19)
        button.isHidden = true
        return button
    }()

    // MARK: - Data

    private var evaluators: [EvaluatorUser] = []
    private var isLoadingEvaluators = false
    private var isLoadingGrades = false

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        loadEvaluators()
    }

    // MARK: - UI Setup

    private func setupUI() {
        title = "Select Evaluator"
        view.backgroundColor = .white

        view.addSubview(tableView)
        view.addSubview(activityIndicator)
        view.addSubview(statusLabel)
        view.addSubview(errorLabel)
        view.addSubview(retryButton)

        tableView.delegate = self
        tableView.dataSource = self

        retryButton.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor),

            statusLabel.topAnchor.constraint(equalTo: activityIndicator.bottomAnchor, constant: 16),
            statusLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            statusLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),

            errorLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            errorLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            errorLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            errorLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),

            retryButton.topAnchor.constraint(equalTo: errorLabel.bottomAnchor, constant: 16),
            retryButton.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])
    }

    // MARK: - Loading

    private func loadEvaluators() {
        isLoadingEvaluators = true
        tableView.isHidden = true
        errorLabel.isHidden = true
        retryButton.isHidden = true
        activityIndicator.startAnimating()
        statusLabel.text = "Loading evaluators..."
        statusLabel.isHidden = false

        APIService.shared.fetchEvaluators { [weak self] result in
            guard let self = self else { return }
            self.isLoadingEvaluators = false
            self.activityIndicator.stopAnimating()

            switch result {
            case .success(let evaluators):
                self.evaluators = evaluators
                self.tableView.reloadData()
                self.tableView.isHidden = false
                self.statusLabel.isHidden = true
            case .failure(let error):
                self.errorLabel.text = error.localizedDescription
                self.errorLabel.isHidden = false
                self.retryButton.isHidden = false
                self.statusLabel.isHidden = true
            }
        }
    }

    @objc private func retryTapped() {
        loadEvaluators()
    }

    // MARK: - Select Evaluator

    private func selectEvaluator(_ evaluator: EvaluatorUser) {
        isLoadingGrades = true
        tableView.isHidden = true
        activityIndicator.startAnimating()
        statusLabel.text = "Loading grades..."
        statusLabel.isHidden = false
        errorLabel.isHidden = true
        retryButton.isHidden = true

        APIService.shared.fetchParameterGrades(evaluatorId: evaluator.uid) { [weak self] result in
            guard let self = self else { return }

            switch result {
            case .success(let dtos):
                self.loadStudentNames(evaluator: evaluator, grades: dtos)
            case .failure(let error):
                self.isLoadingGrades = false
                self.activityIndicator.stopAnimating()
                self.statusLabel.isHidden = true
                self.errorLabel.text = "Failed to load grades: \(error.localizedDescription)"
                self.errorLabel.isHidden = false
                self.retryButton.isHidden = false
            }
        }
    }

    private func loadStudentNames(evaluator: EvaluatorUser, grades: [ParameterGradeDTO]) {
        // Collect all unique student UIDs
        let allStudentUids = Array(Set(grades.flatMap { $0.studentUids ?? [] }))
        let totalCount = allStudentUids.count

        statusLabel.text = "Loading student names (0/\(totalCount))..."

        var studentNames: [String: String] = [:]
        var currentIndex = 0

        func loadNextStudentName() {
            guard currentIndex < allStudentUids.count else {
                // All student names loaded - save data
                self.saveAllData(evaluator: evaluator, grades: grades, studentNames: studentNames)
                return
            }

            let uid = allStudentUids[currentIndex]
            APIService.shared.fetchStudentDisplayName(uid: uid) { [weak self] result in
                guard let self = self else { return }

                if case .success(let name) = result, let name = name {
                    studentNames[uid] = name
                }

                currentIndex += 1
                self.statusLabel.text = "Loading student names (\(currentIndex)/\(totalCount))..."
                loadNextStudentName()
            }
        }

        if allStudentUids.isEmpty {
            saveAllData(evaluator: evaluator, grades: grades, studentNames: studentNames)
        } else {
            loadNextStudentName()
        }
    }

    private func saveAllData(evaluator: EvaluatorUser, grades: [ParameterGradeDTO], studentNames: [String: String]) {
        statusLabel.text = "Saving data..."

        let context = PersistenceController.shared.viewContext

        // Save selected evaluator
        let selectedEvaluatorEntity = SelectedEvaluatorEntity(context: context)
        selectedEvaluatorEntity.uid = evaluator.uid
        selectedEvaluatorEntity.email = evaluator.email
        selectedEvaluatorEntity.displayName = evaluator.displayName

        // Get existing student UIDs to avoid duplicates
        let existingStudents = PersistenceController.shared.fetchStudentDisplayNames()

        // Save student display names (skip existing)
        for (uid, name) in studentNames {
            if existingStudents[uid] == nil {
                let entity = StudentDisplayNameEntity(context: context)
                entity.uid = uid
                entity.displayName = name
            }
        }

        // Get existing parameter grade IDs to avoid duplicates
        let request = ParameterGradeEntity.fetchRequest()
        let existingGrades = (try? context.fetch(request)) ?? []
        let existingGradeIds = Set(existingGrades.map { $0.id })

        // Save parameter grades (skip existing)
        for dto in grades {
            if existingGradeIds.contains(dto.id) {
                continue
            }

            let pg = ParameterGradeEntity(context: context)
            pg.id = dto.id
            pg.examGradeId = dto.examGrade_id
            pg.organization_id = dto.organization_id
            pg.idx = Int32(dto.idx ?? 0)
            pg.label = dto.label
            pg.paramDescription = dto.description
            pg.scoreType = dto.scoreType
            pg.score = dto.score ?? 0
            pg.earnedPoints = dto.earnedPoints ?? 0
            pg.availablePoints = dto.availablePoints ?? 0
            pg.evaluator_uid = dto.evaluator_uid ?? evaluator.uid
            pg.applicationDay = Int32(dto.applicationDay ?? 0)
            pg.isCompleted = dto.isCompleted ?? false
            pg.evaluator_comment = dto.evaluator_comment
            pg.examGradeTitle = dto.examGradeTitle
            pg.expression = dto.expression
            pg.materiaName = dto.materiaName
            pg.level = dto.level
            pg.studentUids = dto.studentUids?.joined(separator: ",")

            for cgDTO in dto.criteriaGrades ?? [] {
                let cg = CriteriaGradeEntity(context: context)
                cg.id = cgDTO.id
                cg.idx = Int32(cgDTO.idx ?? 0)
                cg.label = cgDTO.label
                cg.criteriaDescription = cgDTO.description
                cg.isSelected = cgDTO.isSelected ?? false
                cg.score = cgDTO.score ?? 0
                cg.earnedPoints = cgDTO.earnedPoints ?? 0
                cg.availablePoints = cgDTO.availablePoints ?? 0

                for agDTO in cgDTO.aspectGrades ?? [] {
                    let ag = AspectGradeEntity(context: context)
                    ag.id = agDTO.id
                    ag.idx = Int32(agDTO.idx ?? 0)
                    ag.label = agDTO.label
                    ag.aspectDescription = agDTO.description
                    ag.isGraded = agDTO.isGraded ?? false
                    ag.score = agDTO.score ?? 0
                    ag.hasMedal = agDTO.hasMedal ?? false
                    ag.missingElements = agDTO.missingElements
                    cg.addToAspectGrades(ag)
                }
                pg.addToCriteriaGrades(cg)
            }
        }

        PersistenceController.shared.saveContext()

        isLoadingGrades = false
        activityIndicator.stopAnimating()

        // Navigate to grades list
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
            appDelegate.switchToGradesList()
        }
    }
}

// MARK: - UITableViewDataSource & UITableViewDelegate

extension EvaluatorSelectionViewController: UITableViewDataSource, UITableViewDelegate {

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return evaluators.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "EvaluatorCell", for: indexPath)
        let evaluator = evaluators[indexPath.row]

        cell.textLabel?.font = UIFont.systemFont(ofSize: 20)
        cell.textLabel?.text = evaluator.displayName ?? "Unknown"
        cell.detailTextLabel?.font = UIFont.systemFont(ofSize: 16)
        cell.detailTextLabel?.text = evaluator.email
        cell.accessoryType = .disclosureIndicator

        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let evaluator = evaluators[indexPath.row]
        selectEvaluator(evaluator)
    }
}
