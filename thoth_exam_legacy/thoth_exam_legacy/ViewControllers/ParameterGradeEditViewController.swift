//
//  ParameterGradeEditViewController.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible grade editing screen
//

import UIKit
import CoreData

class ParameterGradeEditViewController: UIViewController {

    // MARK: - Properties

    private let parameterGrade: ParameterGradeEntity
    private var studentNames: [String] = []

    // MARK: - UI Components

    private let scrollView: UIScrollView = {
        let sv = UIScrollView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.alwaysBounceVertical = true
        return sv
    }()

    private let contentView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private let stackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 16
        return sv
    }()

    // Header card components
    private let headerCard: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.backgroundColor = UIColor(white: 0.95, alpha: 1.0)
        view.layer.cornerRadius = 12
        return view
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.boldSystemFont(ofSize: 20)
        label.numberOfLines = 0
        return label
    }()

    private let studentNamesLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 15)
        label.textAlignment = .center
        label.numberOfLines = 0
        return label
    }()

    private let levelLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 15)
        label.textAlignment = .center
        return label
    }()

    private let infoStackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 0
        return sv
    }()

    private let descriptionLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 14)
        label.textColor = .gray
        label.numberOfLines = 0
        return label
    }()

    private let completedLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 14)
        label.textColor = UIColor(red: 0.2, green: 0.7, blue: 0.3, alpha: 1.0)
        label.textAlignment = .right
        label.text = "✓ Completed"
        label.isHidden = true
        return label
    }()

    // Criteria views container
    private let criteriaContainer: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 16
        return sv
    }()

    // Comment section
    private let commentLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "Evaluator Comment"
        label.font = UIFont.boldSystemFont(ofSize: 17)
        return label
    }()

    private let commentTextView: UITextView = {
        let tv = UITextView()
        tv.translatesAutoresizingMaskIntoConstraints = false
        tv.font = UIFont.systemFont(ofSize: 16)
        tv.layer.borderColor = UIColor.lightGray.cgColor
        tv.layer.borderWidth = 1
        tv.layer.cornerRadius = 8
        tv.isScrollEnabled = false
        return tv
    }()

    // Submit button
    private let submitButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Enviar", for: .normal)
        button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 18)
        button.backgroundColor = UIColor(red: 0.0, green: 0.48, blue: 1.0, alpha: 1.0)
        button.setTitleColor(.white, for: .normal)
        button.layer.cornerRadius = 12
        return button
    }()

    // Bottom spacer for keyboard
    private let bottomSpacer: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private var bottomSpacerHeightConstraint: NSLayoutConstraint?

    // MARK: - Initialization

    init(parameterGrade: ParameterGradeEntity) {
        self.parameterGrade = parameterGrade
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        loadStudentNames()
        populateData()
        setupCriteriaViews()
        setupKeyboardDismiss()
        setupKeyboardNotifications()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        persistAndSave()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    // MARK: - UI Setup

    private func setupUI() {
        title = parameterGrade.label ?? "Parameter Grade"
        view.backgroundColor = .white

        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        contentView.addSubview(stackView)

        // Add header card
        stackView.addArrangedSubview(headerCard)
        setupHeaderCard()

        // Add criteria container
        stackView.addArrangedSubview(criteriaContainer)

        // Add comment section
        let commentContainer = UIView()
        commentContainer.translatesAutoresizingMaskIntoConstraints = false
        commentContainer.addSubview(commentLabel)
        commentContainer.addSubview(commentTextView)
        stackView.addArrangedSubview(commentContainer)

        NSLayoutConstraint.activate([
            commentLabel.topAnchor.constraint(equalTo: commentContainer.topAnchor),
            commentLabel.leadingAnchor.constraint(equalTo: commentContainer.leadingAnchor, constant: 16),
            commentLabel.trailingAnchor.constraint(equalTo: commentContainer.trailingAnchor, constant: -16),

            commentTextView.topAnchor.constraint(equalTo: commentLabel.bottomAnchor, constant: 8),
            commentTextView.leadingAnchor.constraint(equalTo: commentContainer.leadingAnchor, constant: 16),
            commentTextView.trailingAnchor.constraint(equalTo: commentContainer.trailingAnchor, constant: -16),
            commentTextView.heightAnchor.constraint(greaterThanOrEqualToConstant: 80),
            commentTextView.bottomAnchor.constraint(equalTo: commentContainer.bottomAnchor)
        ])

        // Add submit button
        stackView.addArrangedSubview(submitButton)
        submitButton.addTarget(self, action: #selector(submitTapped), for: .touchUpInside)

        // Add bottom spacer for keyboard
        stackView.addArrangedSubview(bottomSpacer)
        bottomSpacerHeightConstraint = bottomSpacer.heightAnchor.constraint(equalToConstant: 300)
        bottomSpacerHeightConstraint?.isActive = true

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),

            stackView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            stackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -16),

            submitButton.heightAnchor.constraint(equalToConstant: 50),
            submitButton.leadingAnchor.constraint(equalTo: stackView.leadingAnchor, constant: 16),
            submitButton.trailingAnchor.constraint(equalTo: stackView.trailingAnchor, constant: -16)
        ])
    }

    private func setupHeaderCard() {
        let cardStack = UIStackView()
        cardStack.translatesAutoresizingMaskIntoConstraints = false
        cardStack.axis = .vertical
        cardStack.spacing = 8

        headerCard.addSubview(cardStack)

        cardStack.addArrangedSubview(titleLabel)
        cardStack.addArrangedSubview(studentNamesLabel)
        cardStack.addArrangedSubview(levelLabel)
        cardStack.addArrangedSubview(infoStackView)
        cardStack.addArrangedSubview(descriptionLabel)
        cardStack.addArrangedSubview(completedLabel)

        NSLayoutConstraint.activate([
            cardStack.topAnchor.constraint(equalTo: headerCard.topAnchor, constant: 16),
            cardStack.leadingAnchor.constraint(equalTo: headerCard.leadingAnchor, constant: 16),
            cardStack.trailingAnchor.constraint(equalTo: headerCard.trailingAnchor, constant: -16),
            cardStack.bottomAnchor.constraint(equalTo: headerCard.bottomAnchor, constant: -16),

            headerCard.leadingAnchor.constraint(equalTo: stackView.leadingAnchor, constant: 16),
            headerCard.trailingAnchor.constraint(equalTo: stackView.trailingAnchor, constant: -16)
        ])
    }

    private func populateData() {
        titleLabel.text = parameterGrade.label

        if !studentNames.isEmpty {
            studentNamesLabel.text = studentNames.joined(separator: ", ")
            studentNamesLabel.isHidden = false
        } else {
            studentNamesLabel.isHidden = true
        }

        if let level = parameterGrade.level {
            levelLabel.text = "Ciclo: \(level)"
            levelLabel.isHidden = false
        } else {
            levelLabel.isHidden = true
        }

        // Info rows
        if let materiaName = parameterGrade.materiaName {
            addInfoRow(label: "Materia:", value: materiaName)
        }
        if let title = parameterGrade.examGradeTitle {
            addInfoRow(label: "Título:", value: title)
        }
        if let expression = parameterGrade.expression {
            addInfoRow(label: "Expresión:", value: expression)
        }

        if let desc = parameterGrade.paramDescription, !desc.isEmpty {
            descriptionLabel.text = desc
            descriptionLabel.isHidden = false
        } else {
            descriptionLabel.isHidden = true
        }

        completedLabel.isHidden = !parameterGrade.isCompleted
        commentTextView.text = parameterGrade.evaluator_comment ?? ""
    }

    private func addInfoRow(label: String, value: String) {
        let rowStack = UIStackView()
        rowStack.axis = .horizontal
        rowStack.spacing = 8

        let labelView = UILabel()
        labelView.text = label
        labelView.font = UIFont.systemFont(ofSize: 14)
        labelView.textAlignment = .right
        labelView.setContentHuggingPriority(.defaultHigh, for: .horizontal)

        let valueView = UILabel()
        valueView.text = value
        valueView.font = UIFont.systemFont(ofSize: 14)
        valueView.textAlignment = .center
        valueView.backgroundColor = UIColor(white: 0.9, alpha: 1.0)
        valueView.numberOfLines = 0

        rowStack.addArrangedSubview(labelView)
        rowStack.addArrangedSubview(valueView)

        NSLayoutConstraint.activate([
            labelView.widthAnchor.constraint(equalTo: valueView.widthAnchor)
        ])

        infoStackView.addArrangedSubview(rowStack)
    }

    private func setupCriteriaViews() {
        let scoreType = parameterGrade.scoreType ?? "status"

        for criteriaGrade in parameterGrade.sortedCriteriaGrades {
            let criteriaView = CriteriaGradeView(criteriaGrade: criteriaGrade, scoreType: scoreType)
            criteriaView.onScoreChanged = { [weak self] in
                self?.recalculateDisplayScore()
            }
            criteriaContainer.addArrangedSubview(criteriaView)
        }
    }

    private func loadStudentNames() {
        let uids = parameterGrade.studentUidList
        guard !uids.isEmpty else { return }

        let allNames = PersistenceController.shared.fetchStudentDisplayNames()
        studentNames = uids.map { allNames[$0] ?? $0 }
    }

    private func setupKeyboardDismiss() {
        let tap = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        tap.cancelsTouchesInView = false
        view.addGestureRecognizer(tap)

        // Add toolbar with Done button to keyboard
        let toolbar = UIToolbar()
        toolbar.sizeToFit()
        let flexSpace = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        let doneButton = UIBarButtonItem(title: "Done", style: .done, target: self, action: #selector(dismissKeyboard))
        toolbar.items = [flexSpace, doneButton]
        commentTextView.inputAccessoryView = toolbar
    }

    private func setupKeyboardNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow(_:)),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide(_:)),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
    }

    @objc private func keyboardWillShow(_ notification: Notification) {
        guard let keyboardFrame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect else { return }

        let keyboardHeight = keyboardFrame.height
        let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double ?? 0.25

        UIView.animate(withDuration: duration) {
            self.scrollView.contentInset.bottom = keyboardHeight
            self.scrollView.scrollIndicatorInsets.bottom = keyboardHeight
        }

        // Scroll to make the comment text view visible
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            let rect = self.commentTextView.convert(self.commentTextView.bounds, to: self.scrollView)
            self.scrollView.scrollRectToVisible(rect.insetBy(dx: 0, dy: -50), animated: true)
        }
    }

    @objc private func keyboardWillHide(_ notification: Notification) {
        let duration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double ?? 0.25

        UIView.animate(withDuration: duration) {
            self.scrollView.contentInset.bottom = 0
            self.scrollView.scrollIndicatorInsets.bottom = 0
        }
    }

    @objc private func dismissKeyboard() {
        view.endEditing(true)
    }

    // MARK: - Score Calculation

    private func recalculateDisplayScore() {
        // This updates the UI without saving to CoreData until submit/disappear
    }

    private func persistAndSave() {
        let criteriaList = parameterGrade.sortedCriteriaGrades
        let earned = criteriaList.reduce(0.0) { $0 + $1.earnedPoints }
        let available = criteriaList.reduce(0.0) { $0 + $1.availablePoints }
        parameterGrade.earnedPoints = earned
        parameterGrade.availablePoints = available
        if available > 0 {
            parameterGrade.score = (earned / available * 10 * 10).rounded() / 10
        }

        // Save comment
        let comment = commentTextView.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        parameterGrade.evaluator_comment = comment?.isEmpty == true ? nil : comment

        PersistenceController.shared.saveContext()
    }

    // MARK: - Submit

    @objc private func submitTapped() {
        parameterGrade.isCompleted = true
        persistAndSave()

        // Silent API save
        let pgToDelete = parameterGrade
        let context = PersistenceController.shared.viewContext

        if let examGradeId = pgToDelete.examGradeId {
            APIService.shared.saveParameterGrade(examGradeId: examGradeId, parameterGrade: pgToDelete) { result in
                switch result {
                case .success:
                    // Successfully uploaded - delete from CoreData
                    context.delete(pgToDelete)
                    PersistenceController.shared.saveContext()
                case .failure:
                    // Silent fail - keep in CoreData for later retry
                    break
                }
            }
        }

        navigationController?.popViewController(animated: true)
    }
}
