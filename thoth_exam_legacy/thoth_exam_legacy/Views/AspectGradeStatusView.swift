//
//  AspectGradeStatusView.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible status-based rating view
//

import UIKit

class AspectGradeStatusView: UIView {

    // MARK: - Properties

    private let aspectGrade: AspectGradeEntity
    var onChanged: (() -> Void)?

    private let gradeOptions: [(score: Double, icon: String, color: UIColor, label: String)] = [
        (0, "⊘", .gray, "No aplica"),
        (0.6, "⚠", .red, "Problema"),
        (0.72, "🔧", .orange, "Necesita trabajo"),
        (0.86, "👍", UIColor(red: 0.9, green: 0.8, blue: 0.0, alpha: 1.0), "Casi bien"),
        (1.0, "✓", UIColor(red: 0.2, green: 0.7, blue: 0.3, alpha: 1.0), "Muy bien")
    ]

    // MARK: - UI Components

    private let stackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 8
        return sv
    }()

    private let labelLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 18)
        label.numberOfLines = 0
        return label
    }()

    private let descriptionLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 15)
        label.textColor = .gray
        label.numberOfLines = 0
        return label
    }()

    private let buttonsStackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .horizontal
        sv.spacing = 8
        sv.distribution = .fill
        return sv
    }()

    private var optionButtons: [UIButton] = []

    // MARK: - Initialization

    init(aspectGrade: AspectGradeEntity) {
        self.aspectGrade = aspectGrade
        super.init(frame: .zero)
        setupUI()
        updateSelection()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - UI Setup

    private func setupUI() {
        addSubview(stackView)

        // Label
        labelLabel.text = aspectGrade.label ?? "Aspect \(aspectGrade.idx)"
        stackView.addArrangedSubview(labelLabel)

        // Description
        if let desc = aspectGrade.aspectDescription, !desc.isEmpty {
            descriptionLabel.text = desc
            stackView.addArrangedSubview(descriptionLabel)
        }

        // Buttons
        for (index, option) in gradeOptions.enumerated() {
            let button = UIButton(type: .system)
            button.translatesAutoresizingMaskIntoConstraints = false
            button.setTitle(option.icon, for: .normal)
            button.titleLabel?.font = UIFont.systemFont(ofSize: 26)
            button.tag = index
            button.layer.cornerRadius = 8
            button.addTarget(self, action: #selector(optionTapped(_:)), for: .touchUpInside)

            NSLayoutConstraint.activate([
                button.widthAnchor.constraint(equalToConstant: 44),
                button.heightAnchor.constraint(equalToConstant: 44)
            ])

            optionButtons.append(button)
            buttonsStackView.addArrangedSubview(button)
        }

        // Add spacer to push buttons left
        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        buttonsStackView.addArrangedSubview(spacer)

        stackView.addArrangedSubview(buttonsStackView)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: topAnchor, constant: 4),
            stackView.leadingAnchor.constraint(equalTo: leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -4)
        ])
    }

    private func updateSelection() {
        for (index, button) in optionButtons.enumerated() {
            let option = gradeOptions[index]
            let isSelected = abs(aspectGrade.score - option.score) < 0.01

            if isSelected {
                button.backgroundColor = option.color.withAlphaComponent(0.2)
                button.setTitleColor(option.color, for: .normal)
            } else {
                button.backgroundColor = .clear
                button.setTitleColor(UIColor.gray.withAlphaComponent(0.4), for: .normal)
            }
        }
    }

    // MARK: - Actions

    @objc private func optionTapped(_ sender: UIButton) {
        let option = gradeOptions[sender.tag]
        aspectGrade.score = option.score
        aspectGrade.isGraded = option.score > 0
        updateSelection()
        onChanged?()
    }
}
