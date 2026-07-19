class ActionFeedback {
  const ActionFeedback({
    required this.success,
    required this.message,
    this.requiresVerification,
    this.emailSent,
  });

  final bool success;
  final String message;
  final bool? requiresVerification;
  final bool? emailSent;
}

