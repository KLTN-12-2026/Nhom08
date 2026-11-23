import 'package:flutter/material.dart';

class PermissionDialog extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final String actionText;
  final VoidCallback onAction;
  final VoidCallback? onCancel;

  const PermissionDialog({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    this.actionText = 'Allow',
    required this.onAction,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: Icon(icon, size: 48, color: Theme.of(context).primaryColor),
      title: Text(title, textAlign: TextAlign.center),
      content: Text(description, textAlign: TextAlign.center),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onCancel?.call();
          },
          child: const Text('Not Now'),
        ),
        FilledButton(
          onPressed: () {
            Navigator.of(context).pop();
            onAction();
          },
          child: Text(actionText),
        ),
      ],
    );
  }
}
