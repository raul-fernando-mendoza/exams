//
//  GradeCell.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible table view cell for grade list
//

import UIKit

class GradeCell: UITableViewCell {

    static let reuseIdentifier = "GradeCell"

    // MARK: - UI Components

    private let labelLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.boldSystemFont(ofSize: 20)
        label.numberOfLines = 0
        return label
    }()

    private let titleLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 16)
        label.textColor = .gray
        label.numberOfLines = 0
        return label
    }()

    private let studentNamesLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 16)
        label.numberOfLines = 0
        return label
    }()

    private let completedImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.tintColor = UIColor(red: 0.2, green: 0.7, blue: 0.3, alpha: 1.0)
        imageView.contentMode = .scaleAspectFit
        imageView.isHidden = true
        return imageView
    }()

    private let completedLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "✓"
        label.font = UIFont.systemFont(ofSize: 24)
        label.textColor = UIColor(red: 0.2, green: 0.7, blue: 0.3, alpha: 1.0)
        label.isHidden = true
        return label
    }()

    private let stackView: UIStackView = {
        let sv = UIStackView()
        sv.translatesAutoresizingMaskIntoConstraints = false
        sv.axis = .vertical
        sv.spacing = 4
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
        accessoryType = .disclosureIndicator

        contentView.addSubview(stackView)
        contentView.addSubview(completedLabel)

        stackView.addArrangedSubview(labelLabel)
        stackView.addArrangedSubview(titleLabel)
        stackView.addArrangedSubview(studentNamesLabel)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 12),
            stackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            stackView.trailingAnchor.constraint(equalTo: completedLabel.leadingAnchor, constant: -8),
            stackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -12),

            completedLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            completedLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -8),
            completedLabel.widthAnchor.constraint(equalToConstant: 24)
        ])
    }

    // MARK: - Configuration

    func configure(with grade: ParameterGradeEntity, studentNames: [String]) {
        labelLabel.text = grade.label ?? "Parameter \(grade.idx)"
        titleLabel.text = grade.examGradeTitle
        titleLabel.isHidden = grade.examGradeTitle == nil

        if !studentNames.isEmpty {
            studentNamesLabel.text = studentNames.joined(separator: ", ")
            studentNamesLabel.isHidden = false
        } else {
            studentNamesLabel.isHidden = true
        }

        completedLabel.isHidden = !grade.isCompleted
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        labelLabel.text = nil
        titleLabel.text = nil
        titleLabel.isHidden = false
        studentNamesLabel.text = nil
        studentNamesLabel.isHidden = true
        completedLabel.isHidden = true
    }
}
