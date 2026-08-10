import SwiftUI

struct AspectGradeStarsView: View {
    @ObservedObject var aspectGrade: AspectGradeEntity
    let onChanged: () -> Void

    private let maxStars = 5

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(aspectGrade.label ?? "Aspect \(aspectGrade.idx)")
                .font(.subheadline)

            if let desc = aspectGrade.aspectDescription, !desc.isEmpty {
                Text(desc)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            HStack(spacing: 8) {
                ForEach(1...maxStars, id: \.self) { star in
                    Button {
                        let newScore = Double(star) / Double(maxStars)
                        aspectGrade.score = newScore
                        aspectGrade.isGraded = true
                        onChanged()
                    } label: {
                        Image(systemName: star <= Int(aspectGrade.score * Double(maxStars)) ? "star.fill" : "star")
                            .foregroundColor(.yellow)
                            .font(.title3)
                    }
                }

                Spacer()

                if aspectGrade.isGraded {
                    Button {
                        aspectGrade.score = 0
                        aspectGrade.isGraded = false
                        onChanged()
                    } label: {
                        Image(systemName: "xmark.circle")
                            .foregroundColor(.gray)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}
