import SwiftUI

struct PinEntryView: View {
    let onUnlocked: () -> Void
    var onFailed: (() -> Void)? = nil

    @State private var entered = ""
    @State private var shake = false
    @State private var errorMessage: String?

    private let staticPin = "12345"
    private let pinLength = 5

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "lock.shield")
                    .font(.system(size: 48))
                    .foregroundColor(.accentColor)

                Text("Enter your PIN")
                    .font(.title2)
                    .fontWeight(.semibold)

                if let error = errorMessage {
                    Text(error)
                        .font(.subheadline)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
            }

            HStack(spacing: 16) {
                ForEach(0..<pinLength, id: \.self) { i in
                    Circle()
                        .fill(i < entered.count ? Color.accentColor : Color(.systemGray4))
                        .frame(width: 16, height: 16)
                }
            }
            .modifier(ShakeEffect(shakes: shake ? 4 : 0))
            .animation(.default.repeatCount(4, autoreverses: true).speed(6), value: shake)

            Spacer()

            VStack(spacing: 12) {
                ForEach(0..<3) { row in
                    HStack(spacing: 24) {
                        ForEach(1...3, id: \.self) { col in
                            let digit = row * 3 + col
                            numpadButton(String(digit))
                        }
                    }
                }
                HStack(spacing: 24) {
                    Color.clear.frame(width: 72, height: 72)
                    numpadButton("0")
                    Button {
                        if !entered.isEmpty { entered.removeLast() }
                    } label: {
                        Image(systemName: "delete.left")
                            .font(.title2)
                            .frame(width: 72, height: 72)
                    }
                }
            }
            .padding(.bottom, 32)
        }
        .background(Color(.systemBackground).ignoresSafeArea())
    }

    private func numpadButton(_ digit: String) -> some View {
        Button {
            guard entered.count < pinLength else { return }
            entered += digit
            if entered.count == pinLength {
                validate()
            }
        } label: {
            Text(digit)
                .font(.title)
                .fontWeight(.medium)
                .frame(width: 72, height: 72)
                .background(Color(.systemGray5))
                .clipShape(Circle())
        }
    }

    private func validate() {
        if entered == staticPin {
            onUnlocked()
        } else {
            entered = ""
            if let onFailed {
                triggerError("Incorrect PIN. Returning to grades page...")
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { onFailed() }
            } else {
                triggerError("Incorrect PIN. Try again.")
            }
        }
    }

    private func triggerError(_ msg: String) {
        errorMessage = msg
        shake = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { shake = false }
    }
}

struct ShakeEffect: GeometryEffect {
    var shakes: Int
    var animatableData: CGFloat {
        get { CGFloat(shakes) }
        set { shakes = Int(newValue) }
    }

    func effectValue(size: CGSize) -> ProjectionTransform {
        let offset = sin(animatableData * .pi * 2) * 10
        return ProjectionTransform(CGAffineTransform(translationX: offset, y: 0))
    }
}
