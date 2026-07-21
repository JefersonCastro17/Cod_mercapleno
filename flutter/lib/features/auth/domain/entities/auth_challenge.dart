class AuthChallenge {
  const AuthChallenge({
    required this.pendingToken,
    required this.email,
    this.expiresInMinutes,
  });

  final String pendingToken;
  final String email;
  final int? expiresInMinutes;
}

