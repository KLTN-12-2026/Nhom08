import 'package:flutter/material.dart';

class GifLoadingWidget extends StatelessWidget {
  final String? message;
  final Color? backgroundColor;
  final double? gifSize;
  final String gifPath;

  const GifLoadingWidget({
    Key? key,
    this.message,
    this.backgroundColor,
    this.gifSize,
    this.gifPath = 'assets/gifs/loading.gif',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: backgroundColor ?? const Color(0xFFFFBF1C),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // GIF Animation
            Image.asset(
              gifPath,
              width: gifSize ?? 120,
              height: gifSize ?? 120,
              fit: BoxFit.contain,
            ),

            // Message
            if (message != null) ...[
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  message!,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class GifLoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final String? message;
  final Color? overlayColor;
  final double? gifSize;
  final String gifPath;

  const GifLoadingOverlay({
    Key? key,
    required this.isLoading,
    required this.child,
    this.message,
    this.overlayColor,
    this.gifSize,
    this.gifPath = 'assets/gifs/loading.gif',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            color: overlayColor ?? Colors.black.withOpacity(0.5),
            child: Center(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // GIF Animation
                    Image.asset(
                      gifPath,
                      width: gifSize ?? 80,
                      height: gifSize ?? 80,
                      fit: BoxFit.contain,
                    ),

                    // Message
                    if (message != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        message!,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.black87,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class GifLoadingDialog extends StatelessWidget {
  final String? message;
  final bool barrierDismissible;
  final double? gifSize;
  final String gifPath;

  const GifLoadingDialog({
    Key? key,
    this.message,
    this.barrierDismissible = false,
    this.gifSize,
    this.gifPath = 'assets/gifs/loading.gif',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => barrierDismissible,
      child: Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // GIF Animation
              Image.asset(
                gifPath,
                width: gifSize ?? 80,
                height: gifSize ?? 80,
                fit: BoxFit.contain,
              ),

              // Message
              if (message != null) ...[
                const SizedBox(height: 16),
                Text(
                  message!,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class GifLoadingScreen extends StatelessWidget {
  final String? message;
  final Color? backgroundColor;
  final double? gifSize;
  final String gifPath;
  final Duration? autoCloseDuration;

  const GifLoadingScreen({
    Key? key,
    this.message,
    this.backgroundColor,
    this.gifSize,
    this.gifPath = 'assets/gifs/loading.gif',
    this.autoCloseDuration,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Auto close if duration is provided
    if (autoCloseDuration != null) {
      Future.delayed(autoCloseDuration!, () {
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
      });
    }

    return Scaffold(
      backgroundColor: backgroundColor ?? const Color(0xFFFFBF1C),
      body: GifLoadingWidget(
        message: message,
        backgroundColor: backgroundColor,
        gifSize: gifSize,
        gifPath: gifPath,
      ),
    );
  }
}
