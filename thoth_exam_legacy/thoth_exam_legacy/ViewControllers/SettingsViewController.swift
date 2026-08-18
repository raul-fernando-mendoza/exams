//
//  SettingsViewController.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible settings screen
//

import UIKit
import CoreData

class SettingsViewController: UIViewController {

    // MARK: - Callbacks

    var onDismiss: (() -> Void)?

    // MARK: - Properties

    private var parameterGrades: [ParameterGradeEntity] = []
    private var evaluators: [EvaluatorEntity] = []
    private var selectedEvaluatorUid: String = ""

    private var isSaving = false
    private var saveProgress: (current: Int, total: Int) = (0, 0)

    private var isLoadingGrades = false
    private var loadProgress: String = ""
    private var loadError: String?

    // MARK: - Computed Properties

    private var completedGrades: [ParameterGradeEntity] {
        parameterGrades.filter { $0.isCompleted && $0.examGradeId != nil }
    }

    private var gradesByEvaluator: [(evaluatorUid: String, evaluatorName: String, grades: [ParameterGradeEntity])] {
        let grouped = Dictionary(grouping: parameterGrades) { $0.evaluator_uid ?? "" }
        return grouped
            .filter { !$0.key.isEmpty && !$0.value.isEmpty }
            .map { (uid, grades) in
                let name = evaluators.first(where: { $0.uid == uid })?.displayName ?? uid
                return (evaluatorUid: uid, evaluatorName: name, grades: grades.sorted { ($0.examGradeTitle ?? "") < ($1.examGradeTitle ?? "") })
            }
            .sorted { $0.evaluatorName < $1.evaluatorName }
    }

    // MARK: - UI Components

    private let tableView: UITableView = {
        let table = UITableView(frame: .zero, style: .grouped)
        table.translatesAutoresizingMaskIntoConstraints = false
        table.register(SettingsGradeCell.self, forCellReuseIdentifier: SettingsGradeCell.reuseIdentifier)
        table.register(UITableViewCell.self, forCellReuseIdentifier: "ActionCell")
        table.register(UITableViewCell.self, forCellReuseIdentifier: "EvaluatorCell")
        return table
    }()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        loadData()
    }

    // MARK: - UI Setup

    private func setupUI() {
        title = "Settings"
        view.backgroundColor = .white

        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "Done",
            style: .done,
            target: self,
            action: #selector(doneTapped)
        )

        view.addSubview(tableView)
        tableView.delegate = self
        tableView.dataSource = self

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func loadData() {
        parameterGrades = PersistenceController.shared.fetchAllParameterGrades()
        evaluators = PersistenceController.shared.fetchEvaluators()
        selectedEvaluatorUid = PersistenceController.shared.fetchSelectedEvaluator()?.uid ?? ""
        tableView.reloadData()
    }

    // MARK: - Actions

    @objc private func doneTapped() {
        dismiss(animated: true) { [weak self] in
            self?.onDismiss?()
        }
    }

    private func reiniciarGrade(_ grade: ParameterGradeEntity) {
        // Reset parameter grade
        grade.isCompleted = false
        grade.score = 10
        grade.earnedPoints = 1
        grade.evaluator_comment = nil

        // Reset all criteria grades
        for criteriaGrade in grade.sortedCriteriaGrades {
            criteriaGrade.isSelected = false
            criteriaGrade.score = 10
            criteriaGrade.earnedPoints = 1

            // Reset all aspect grades
            for aspectGrade in criteriaGrade.sortedAspectGrades {
                aspectGrade.isGraded = false
                aspectGrade.score = 1
                aspectGrade.hasMedal = false
                aspectGrade.missingElements = nil
            }
        }

        PersistenceController.shared.saveContext()
        loadData()
    }

    private func saveAllGrades() {
        let grades = completedGrades
        guard !grades.isEmpty else {
            showAlert(title: "Nothing to save", message: "No completed grades to synchronize.")
            return
        }

        isSaving = true
        saveProgress = (0, grades.count)
        tableView.reloadData()

        var failed: [String] = []
        var succeeded: [ParameterGradeEntity] = []
        var currentIndex = 0

        func saveNextGrade() {
            guard currentIndex < grades.count else {
                // All done
                finishSaving(succeeded: succeeded, failed: failed)
                return
            }

            let pg = grades[currentIndex]
            guard let examGradeId = pg.examGradeId else {
                failed.append(pg.label ?? pg.id)
                currentIndex += 1
                saveProgress.current = currentIndex
                tableView.reloadData()
                saveNextGrade()
                return
            }

            APIService.shared.saveParameterGrade(examGradeId: examGradeId, parameterGrade: pg) { [weak self] result in
                guard let self = self else { return }

                switch result {
                case .success:
                    succeeded.append(pg)
                case .failure:
                    failed.append(pg.label ?? pg.id)
                }

                currentIndex += 1
                self.saveProgress.current = currentIndex
                self.tableView.reloadData()
                saveNextGrade()
            }
        }

        saveNextGrade()
    }

    private func finishSaving(succeeded: [ParameterGradeEntity], failed: [String]) {
        // Delete successfully uploaded grades
        let context = PersistenceController.shared.viewContext
        for pg in succeeded {
            context.delete(pg)
        }
        PersistenceController.shared.saveContext()

        isSaving = false
        loadData()

        if failed.isEmpty {
            showAlert(title: "Saved", message: "All \(succeeded.count) grade(s) were saved and removed from device.")
        } else {
            showAlert(title: "Save failed", message: "Could not save: \(failed.joined(separator: ", "))")
        }
    }

    private func showResetAllConfirmation() {
        let hasCompleted = !completedGrades.isEmpty
        let message = hasCompleted
            ? "Las calificaciones que no han sido sincronizadas se perderan. ¿Esta seguro de continuar?"
            : "All data will be erased. You will need to select an evaluator and reload grades from the server."

        let alert = UIAlertController(title: "Reset All Data?", message: message, preferredStyle: .actionSheet)

        alert.addAction(UIAlertAction(title: "Reset", style: .destructive) { [weak self] _ in
            self?.resetAndReloadData()
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))

        present(alert, animated: true)
    }

    private func resetAndReloadData() {
        isLoadingGrades = true
        loadError = nil
        loadProgress = "Fetching evaluators..."
        tableView.reloadData()

        APIService.shared.fetchEvaluators { [weak self] result in
            guard let self = self else { return }

            switch result {
            case .success(let apiEvaluators):
                self.fetchAllGrades(apiEvaluators: apiEvaluators)
            case .failure(let error):
                self.isLoadingGrades = false
                self.loadError = "Failed to fetch data: \(error.localizedDescription). Existing data was preserved."
                self.tableView.reloadData()
            }
        }
    }

    private func fetchAllGrades(apiEvaluators: [EvaluatorUser]) {
        var allGrades: [(EvaluatorUser, [ParameterGradeDTO])] = []
        var allStudentUids: Set<String> = []
        var currentIndex = 0

        func fetchNextEvaluatorGrades() {
            guard currentIndex < apiEvaluators.count else {
                // All evaluator grades fetched, now fetch student names
                fetchAllStudentNames(apiEvaluators: apiEvaluators, allGrades: allGrades, allStudentUids: Array(allStudentUids))
                return
            }

            let evaluator = apiEvaluators[currentIndex]
            loadProgress = "Fetching grades for evaluator \(currentIndex + 1)/\(apiEvaluators.count)..."
            tableView.reloadData()

            APIService.shared.fetchParameterGrades(evaluatorId: evaluator.uid) { [weak self] result in
                guard let self = self else { return }

                switch result {
                case .success(let dtos):
                    allGrades.append((evaluator, dtos))
                    for dto in dtos {
                        if let uids = dto.studentUids {
                            allStudentUids.formUnion(uids)
                        }
                    }
                    currentIndex += 1
                    fetchNextEvaluatorGrades()

                case .failure(let error):
                    self.isLoadingGrades = false
                    self.loadError = "Failed to fetch grades: \(error.localizedDescription)"
                    self.tableView.reloadData()
                }
            }
        }

        fetchNextEvaluatorGrades()
    }

    private func fetchAllStudentNames(apiEvaluators: [EvaluatorUser], allGrades: [(EvaluatorUser, [ParameterGradeDTO])], allStudentUids: [String]) {
        var studentNames: [String: String] = [:]
        var currentIndex = 0

        func fetchNextStudentName() {
            guard currentIndex < allStudentUids.count else {
                // All student names fetched, save all data
                saveAllNewData(apiEvaluators: apiEvaluators, allGrades: allGrades, studentNames: studentNames)
                return
            }

            let uid = allStudentUids[currentIndex]
            loadProgress = "Fetching student names (\(currentIndex + 1)/\(allStudentUids.count))..."
            tableView.reloadData()

            APIService.shared.fetchStudentDisplayName(uid: uid) { [weak self] result in
                if case .success(let name) = result, let name = name {
                    studentNames[uid] = name
                }
                currentIndex += 1
                fetchNextStudentName()
            }
        }

        if allStudentUids.isEmpty {
            saveAllNewData(apiEvaluators: apiEvaluators, allGrades: allGrades, studentNames: studentNames)
        } else {
            fetchNextStudentName()
        }
    }

    private func saveAllNewData(apiEvaluators: [EvaluatorUser], allGrades: [(EvaluatorUser, [ParameterGradeDTO])], studentNames: [String: String]) {
        loadProgress = "Clearing old data..."
        tableView.reloadData()

        PersistenceController.shared.deleteAllData()

        loadProgress = "Saving new data..."
        tableView.reloadData()

        let context = PersistenceController.shared.viewContext

        // Save evaluators
        for apiEval in apiEvaluators {
            let entity = EvaluatorEntity(context: context)
            entity.uid = apiEval.uid
            entity.email = apiEval.email
            entity.displayName = apiEval.displayName
        }
        PersistenceController.shared.saveContext()

        // Save student names
        for (uid, name) in studentNames {
            let entity = StudentDisplayNameEntity(context: context)
            entity.uid = uid
            entity.displayName = name
        }
        PersistenceController.shared.saveContext()

        // Save grades for each evaluator
        for (evaluator, grades) in allGrades {
            saveEvaluatorGrades(evaluator: evaluator, grades: grades)
        }

        isLoadingGrades = false
        selectedEvaluatorUid = ""
        loadData()
    }

    private func saveEvaluatorGrades(evaluator: EvaluatorUser, grades: [ParameterGradeDTO]) {
        let context = PersistenceController.shared.viewContext

        for dto in grades {
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
    }

    private func selectEvaluator(_ evaluator: EvaluatorEntity) {
        let context = PersistenceController.shared.viewContext

        // Delete existing selected evaluator
        let request = SelectedEvaluatorEntity.fetchRequest()
        if let existing = try? context.fetch(request) {
            for entity in existing {
                context.delete(entity)
            }
        }

        // Create new selected evaluator
        let selectedEntity = SelectedEvaluatorEntity(context: context)
        selectedEntity.uid = evaluator.uid
        selectedEntity.email = evaluator.email
        selectedEntity.displayName = evaluator.displayName

        PersistenceController.shared.saveContext()
        selectedEvaluatorUid = evaluator.uid
        tableView.reloadData()
    }

    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

// MARK: - UITableViewDataSource & UITableViewDelegate

extension SettingsViewController: UITableViewDataSource, UITableViewDelegate {

    func numberOfSections(in tableView: UITableView) -> Int {
        // Sections: Grades by evaluator, Sync, Reset All, Change Evaluator
        return gradesByEvaluator.count + 3
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section < gradesByEvaluator.count {
            return gradesByEvaluator[section].grades.count
        } else if section == gradesByEvaluator.count {
            // Sync section
            return 1
        } else if section == gradesByEvaluator.count + 1 {
            // Reset section
            return 1
        } else {
            // Change evaluator section
            if isLoadingGrades {
                return 1
            } else if loadError != nil {
                return 1
            } else {
                return evaluators.count
            }
        }
    }

    func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        if section < gradesByEvaluator.count {
            return gradesByEvaluator[section].evaluatorName
        } else if section == gradesByEvaluator.count {
            return "Sync"
        } else if section == gradesByEvaluator.count + 1 {
            return "Danger Zone"
        } else {
            return "Change Evaluator"
        }
    }

    func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        if section == gradesByEvaluator.count {
            let count = completedGrades.count
            return count > 0 ? "Upload \(count) completed grade(s) to the server." : nil
        } else if section == gradesByEvaluator.count + 1 {
            return "This will delete all stored grades and return to evaluator selection."
        } else if section == gradesByEvaluator.count + 2 {
            return "Select a different evaluator to grade exams."
        }
        return nil
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section < gradesByEvaluator.count {
            // Grade cell with Reiniciar button
            let cell = tableView.dequeueReusableCell(withIdentifier: SettingsGradeCell.reuseIdentifier, for: indexPath) as! SettingsGradeCell
            let grade = gradesByEvaluator[indexPath.section].grades[indexPath.row]

            cell.configure(with: grade)
            cell.delegate = self

            return cell

        } else if indexPath.section == gradesByEvaluator.count {
            // Sync section
            let cell = tableView.dequeueReusableCell(withIdentifier: "ActionCell", for: indexPath)

            if isSaving {
                cell.textLabel?.text = "Saving \(saveProgress.current) of \(saveProgress.total)..."
                cell.textLabel?.textColor = .gray
                cell.accessoryType = .none
            } else if completedGrades.isEmpty {
                cell.textLabel?.text = "No hay ningun examen terminado por enviar."
                cell.textLabel?.textColor = .gray
                cell.accessoryType = .none
            } else {
                cell.textLabel?.text = "Sincronizar"
                cell.textLabel?.textColor = view.tintColor
                cell.accessoryType = .disclosureIndicator
            }

            return cell

        } else if indexPath.section == gradesByEvaluator.count + 1 {
            // Reset section
            let cell = tableView.dequeueReusableCell(withIdentifier: "ActionCell", for: indexPath)
            cell.textLabel?.text = "Reset All Data"
            cell.textLabel?.textColor = .red
            cell.accessoryType = .none
            return cell

        } else {
            // Change evaluator section
            let cell = tableView.dequeueReusableCell(withIdentifier: "EvaluatorCell", for: indexPath)

            if isLoadingGrades {
                cell.textLabel?.text = loadProgress
                cell.textLabel?.textColor = .gray
                cell.accessoryType = .none
            } else if let error = loadError {
                cell.textLabel?.text = error
                cell.textLabel?.textColor = .red
                cell.textLabel?.numberOfLines = 0
                cell.accessoryType = .none
            } else if indexPath.row < evaluators.count {
                let evaluator = evaluators[indexPath.row]
                cell.textLabel?.text = evaluator.displayName ?? "Unknown"
                cell.textLabel?.textColor = .black
                cell.accessoryType = selectedEvaluatorUid == evaluator.uid ? .checkmark : .none
            }

            return cell
        }
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)

        if indexPath.section == gradesByEvaluator.count {
            // Sync tapped
            if !isSaving && !completedGrades.isEmpty {
                saveAllGrades()
            }
        } else if indexPath.section == gradesByEvaluator.count + 1 {
            // Reset tapped
            showResetAllConfirmation()
        } else if indexPath.section == gradesByEvaluator.count + 2 && !isLoadingGrades && loadError == nil {
            // Evaluator tapped
            if indexPath.row < evaluators.count {
                selectEvaluator(evaluators[indexPath.row])
            }
        }
    }

}

// MARK: - SettingsGradeCellDelegate

extension SettingsViewController: SettingsGradeCellDelegate {

    func settingsGradeCellDidTapReiniciar(_ cell: SettingsGradeCell) {
        guard let indexPath = tableView.indexPath(for: cell),
              indexPath.section < gradesByEvaluator.count else { return }

        let grade = gradesByEvaluator[indexPath.section].grades[indexPath.row]
        reiniciarGrade(grade)
    }
}
