import 'package:flutter/material.dart';

class AuthPageShell extends StatelessWidget {
  const AuthPageShell({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    required this.switchLabel,
    required this.switchIcon,
    required this.onSwitchPressed,
    this.errorMessage,
    this.infoMessage,
    this.showLoadingBar = false,
  });

  final String title;
  final String subtitle;
  final Widget child;
  final String switchLabel;
  final IconData switchIcon;
  final VoidCallback? onSwitchPressed;
  final String? errorMessage;
  final String? infoMessage;
  final bool showLoadingBar;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF0A4D92),
                Color(0xFF0D2E4D),
                Color(0xFFF4F7FB),
              ],
              stops: [0, 0.35, 1],
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const _BrandHeader(),
                      const SizedBox(height: 24),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                title,
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                subtitle,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: const Color(0xFF52606D),
                                  height: 1.5,
                                ),
                              ),
                              if (showLoadingBar) ...[
                                const SizedBox(height: 16),
                                const LinearProgressIndicator(
                                  minHeight: 5,
                                  borderRadius: BorderRadius.all(
                                    Radius.circular(99),
                                  ),
                                ),
                              ],
                              if (errorMessage != null) ...[
                                const SizedBox(height: 20),
                                _MessageCard(
                                  message: errorMessage!,
                                  backgroundColor: const Color(0xFFFFE6E3),
                                  foregroundColor: const Color(0xFF8F3020),
                                  icon: Icons.error_outline,
                                ),
                              ],
                              if (infoMessage != null) ...[
                                const SizedBox(height: 12),
                                _MessageCard(
                                  message: infoMessage!,
                                  backgroundColor: const Color(0xFFE7F2FF),
                                  foregroundColor: const Color(0xFF0B4A8B),
                                  icon: Icons.info_outline,
                                ),
                              ],
                              const SizedBox(height: 20),
                              AnimatedSwitcher(
                                duration: const Duration(milliseconds: 220),
                                child: child,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        bottomNavigationBar: _BottomMenu(
          switchLabel: switchLabel,
          switchIcon: switchIcon,
          onSwitchPressed: onSwitchPressed,
        ),
      ),
    );
  }
}

class _BottomMenu extends StatelessWidget {
  const _BottomMenu({
    required this.switchLabel,
    required this.switchIcon,
    required this.onSwitchPressed,
  });

  final String switchLabel;
  final IconData switchIcon;
  final VoidCallback? onSwitchPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.popUntil(context, (route) => route.isFirst);
              },
              icon: const Icon(Icons.home),
              label: const Text('Inicio'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: FilledButton.icon(
              onPressed: onSwitchPressed,
              icon: Icon(switchIcon),
              label: Text(switchLabel),
            ),
          ),
        ],
      ),
    );
  }
}

class _BrandHeader extends StatelessWidget {
  const _BrandHeader();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFF4A300), Color(0xFFF97316)],
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x3DF4A300),
                blurRadius: 24,
                offset: Offset(0, 14),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'M',
              style: TextStyle(
                color: Colors.white,
                fontSize: 38,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),
        const Text(
          'Mercapleno Mobile',
          style: TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Autenticacion, registro y recuperacion conectados al backend',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Color(0xFFD5E6F6),
            fontSize: 15,
            height: 1.45,
          ),
        ),
      ],
    );
  }
}

class _MessageCard extends StatelessWidget {
  const _MessageCard({
    required this.message,
    required this.backgroundColor,
    required this.foregroundColor,
    required this.icon,
  });

  final String message;
  final Color backgroundColor;
  final Color foregroundColor;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: foregroundColor),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: foregroundColor,
                height: 1.45,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
