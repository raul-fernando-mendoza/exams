import SwiftUI

struct AspectGradeStatusView: View {
    @ObservedObject var aspectGrade: AspectGradeEntity
    let onChanged: () -> Void

    private let gradeOptions: [(score: Double, icon: String, color: Color, label: String)] = [
        (0, "nosign", .gray, "No aplica"),
        (0.6, "exclamationmark.triangle.fill", .red, "Problema"),
        (0.72, "wrench.fill", .orange, "Necesita trabajo"),
        (0.86, "hand.thumbsup.fill", .yellow, "Casi bien"),
        (1.0, "checkmark.seal.fill", .green, "Muy bien")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(aspectGrade.label ?? "Aspect \(aspectGrade.idx)")
                    .font(.subheadline)
            }

            if let desc = aspectGrade.aspectDescription, !desc.isEmpty {
                Text(desc)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            HStack(spacing: 8) {
                ForEach(gradeOptions, id: \.score) { option in
                    Button {
                        aspectGrade.score = option.score
                        onChanged()
                    } label: {
                        Image(systemName: option.icon)
                            .font(.title2)
                            .foregroundColor(isSelected(option.score) ? option.color : .gray.opacity(0.4))
                            .frame(width: 44, height: 44)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(isSelected(option.score) ? option.color.opacity(0.2) : Color.clear)
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                Spacer()
            }
        }
        .padding(.vertical, 4)
    }

    private func isSelected(_ score: Double) -> Bool {
        abs(aspectGrade.score - score) < 0.01
    }
}
