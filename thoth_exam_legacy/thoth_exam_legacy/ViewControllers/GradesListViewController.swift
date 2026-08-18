//
//  GradesListViewController.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible main grades list screen
//

import UIKit
import CoreData

class GradesListViewController: UIViewController {

    // MARK: - UI Components

    private let tableView: UITableView = {
        let table = UITableView(frame: .zero, style: .plain)
        table.translatesAutoresizingMaskIntoConstraints = false
        table.register(GradeCell.self, forCellReuseIdentifier: GradeCell.reuseIdentifier)
        return table
    }()

    private let emptyStateView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.isHidden = true
        return view
    }()

    private let emptyIconLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "✓"
        label.font = UIFont.systemFont(ofSize: 48)
        label.textColor = .gray
        label.textAlignment = .center
        return label
    }()

    private let emptyLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "No hay mas examenes pendientes por calificar."
        label.textColor = .gray
        label.textAlignment = .center
        label.numberOfLines = 0
        label.font = UIFont.systemFont(ofSize: 16)
        return label
    }()

    // MARK: - Data

    private var parameterGrades: [ParameterGradeEntity] = []
    private var studentNames: [String: String] = [:]
    private var selectedEvaluatorUid: String = ""
    private var selectedEvaluatorName: String = "Grades"

    private var fetchedResultsController: NSFetchedResultsController<ParameterGradeEntity>?

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupFetchedResultsController()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        refreshData()
    }

    // MARK: - UI Setup

    private func setupUI() {
        view.backgroundColor = .white

        // Navigation bar - use text for iOS 12 compatibility
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "⚙",
            style: .plain,
            target: self,
            action: #selector(settingsTapped)
        )

        // Add subviews
        view.addSubview(tableView)
        view.addSubview(emptyStateView)
        emptyStateView.addSubview(emptyIconLabel)
        emptyStateView.addSubview(emptyLabel)

        tableView.delegate = self
        tableView.dataSource = self

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            emptyStateView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            emptyStateView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            emptyStateView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            emptyStateView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),

            emptyIconLabel.topAnchor.constraint(equalTo: emptyStateView.topAnchor),
            emptyIconLabel.centerXAnchor.constraint(equalTo: emptyStateView.centerXAnchor),

            emptyLabel.topAnchor.constraint(equalTo: emptyIconLabel.bottomAnchor, constant: 16),
            emptyLabel.leadingAnchor.constraint(equalTo: emptyStateView.leadingAnchor),
            emptyLabel.trailingAnchor.constraint(equalTo: emptyStateView.trailingAnchor),
            emptyLabel.bottomAnchor.constraint(equalTo: emptyStateView.bottomAnchor)
        ])
    }

    // MARK: - Data Management

    private func setupFetchedResultsController() {
        let request = ParameterGradeEntity.fetchRequest()
        request.sortDescriptors = [
            NSSortDescriptor(key: "examGradeTitle", ascending: true),
            NSSortDescriptor(key: "label", ascending: true)
        ]

        fetchedResultsController = NSFetchedResultsController(
            fetchRequest: request,
            managedObjectContext: PersistenceController.shared.viewContext,
            sectionNameKeyPath: nil,
            cacheName: nil
        )
        fetchedResultsController?.delegate = self

        try? fetchedResultsController?.performFetch()
    }

    private func refreshData() {
        refreshSelectedEvaluator()
        studentNames = PersistenceController.shared.fetchStudentDisplayNames()
        reloadGrades()

        // If no evaluator selected, show settings
        if selectedEvaluatorUid.isEmpty {
            showSettings()
        }
    }

    private func refreshSelectedEvaluator() {
        if let evaluator = PersistenceController.shared.fetchSelectedEvaluator() {
            selectedEvaluatorUid = evaluator.uid
            selectedEvaluatorName = evaluator.displayName ?? "Grades"
        } else {
            selectedEvaluatorUid = ""
            selectedEvaluatorName = "Grades"
        }
        title = selectedEvaluatorName
    }

    private func reloadGrades() {
        // Filter grades for selected evaluator that are not completed
        let allGrades = fetchedResultsController?.fetchedObjects ?? []
        parameterGrades = allGrades.filter {
            !$0.isCompleted && $0.evaluator_uid == selectedEvaluatorUid
        }.sorted {
            ($0.examGradeTitle ?? "") < ($1.examGradeTitle ?? "")
        }

        tableView.reloadData()
        updateEmptyState()
    }

    private func updateEmptyState() {
        let isEmpty = parameterGrades.isEmpty
        tableView.isHidden = isEmpty
        emptyStateView.isHidden = !isEmpty
    }

    // MARK: - Actions

    @objc private func settingsTapped() {
        let pinVC = PinEntryViewController()
        pinVC.onUnlocked = { [weak self] in
            self?.dismiss(animated: true) {
                self?.showSettings()
            }
        }
        pinVC.onFailed = { [weak self] in
            self?.dismiss(animated: true)
        }
        pinVC.modalPresentationStyle = .fullScreen
        present(pinVC, animated: true)
    }

    private func showSettings() {
        let settingsVC = SettingsViewController()
        settingsVC.onDismiss = { [weak self] in
            self?.refreshData()
        }
        let navController = UINavigationController(rootViewController: settingsVC)
        navController.modalPresentationStyle = .formSheet
        present(navController, animated: true)
    }
}

// MARK: - UITableViewDataSource & UITableViewDelegate

extension GradesListViewController: UITableViewDataSource, UITableViewDelegate {

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return parameterGrades.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: GradeCell.reuseIdentifier, for: indexPath) as! GradeCell
        let grade = parameterGrades[indexPath.row]

        let names = grade.studentUidList.map { studentNames[$0] ?? $0 }
        cell.configure(with: grade, studentNames: names)

        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let grade = parameterGrades[indexPath.row]

        let editVC = ParameterGradeEditViewController(parameterGrade: grade)
        navigationController?.pushViewController(editVC, animated: true)
    }

    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return UITableView.automaticDimension
    }

    func tableView(_ tableView: UITableView, estimatedHeightForRowAt indexPath: IndexPath) -> CGFloat {
        return 80
    }
}

// MARK: - NSFetchedResultsControllerDelegate

extension GradesListViewController: NSFetchedResultsControllerDelegate {

    func controllerDidChangeContent(_ controller: NSFetchedResultsController<NSFetchRequestResult>) {
        reloadGrades()
    }
}
