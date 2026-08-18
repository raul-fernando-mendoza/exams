//
//  SettingsGradeCell.swift
//  thoth_exam_legacy
//
//  Custom cell for settings grade list with inline Reiniciar button
//

import UIKit

protocol SettingsGradeCellDelegate: AnyObject {
    func settingsGradeCellDidTapReiniciar(_ cell: SettingsGradeCell)
}

class SettingsGradeCell: UITableViewCell {

    static let reuseIdentifier = "SettingsGradeCell"

    weak var delegate: SettingsGradeCellDelegate?

    // MARK: - UI Components

    private let labelLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 15)
        label.numberOfLines = 0
        return label
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 12)
        label.textColor = .gray
        label.numberOfLines = 0
        return label
    }()

    private let completedImageLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "✓"
        label.font = UIFont.systemFont(ofSize: 18)
        label.textColor = UIColor(red: 0.2, green: 0.7, blue: 0.3, alpha: 1.0)
        label.isHidden = true
        return label
    }()

    private let reiniciarButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Reiniciar", for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 12)
        button.setTitleColor(.orange, for: .normal)
        return button
    }()

    private let stackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 2
        return sv
    }()

    // MARK: - Initialization

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - UI Setup

    private func setupUI() {
        selectionStyle = .none

        contentView.addSubview(stackView)
        contentView.addSubview(completedImageLabel)
        contentView.addSubview(reiniciarButton)

        stackView.addArrangedSubview(labelLabel)
        stackView.addArrangedSubview(titleLabel)

        reiniciarButton.addTarget(self, action: #selector(reiniciarTapped), for: .touchUpInside)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 10),
            stackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            stackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -10),
            stackView.trailingAnchor.constraint(lessThanOrEqualTo: completedImageLabel.leadingAnchor, constant: -8),

            completedImageLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            completedImageLabel.trailingAnchor.constraint(equalTo: reiniciarButton.leadingAnchor, constant: -12),
            completedImageLabel.widthAnchor.constraint(equalToConstant: 20),

            reiniciarButton.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            reiniciarButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16)
        ])
    }

    // MARK: - Configuration

    func configure(with grade: ParameterGradeEntity) {
        labelLabel.text = grade.label ?? "Unknown"

        if let title = grade.examGradeTitle, !title.isEmpty {
            titleLabel.text = title
            titleLabel.isHidden = false
        } else {
            titleLabel.isHidden = true
        }

        completedImageLabel.isHidden = !grade.isCompleted
    }

    // MARK: - Actions

    @objc private func reiniciarTapped() {
        delegate?.settingsGradeCellDidTapReiniciar(self)
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        labelLabel.text = nil
        titleLabel.text = nil
        titleLabel.isHidden = true
        completedImageLabel.isHidden = true
        delegate = nil
    }
}
