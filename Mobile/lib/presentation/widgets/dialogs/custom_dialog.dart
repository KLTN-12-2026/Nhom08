import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart';

class CustomDialog extends StatelessWidget {
  final String? title;
  final String? content;
  final String? image;
  final List<Widget> actions;
  final EdgeInsetsGeometry? padding;
  final double? heightImage;
  final Widget? widgetContent;
  final Color? backgroundColor;

  const CustomDialog({
    super.key,
    this.title,
    this.content,
    this.image,
    this.heightImage,
    this.padding,
    this.widgetContent,
    required this.actions,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: padding ?? EdgeInsets.symmetric(horizontal: 24),
        child: Container(
          padding: EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: backgroundColor ?? Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                if (image != null)
                  Image.asset(
                    image!,
                    height: heightImage ?? 200,
                  ),
                if (widgetContent != null) widgetContent!,
                if (title != null) ...[
                  SizedBox(height: 24),
                  Text(
                    title!,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.w800,
                        decoration: TextDecoration.none),
                  ),
                ],
                if (content != null) ...[
                  SizedBox(height: 24),
                  Text(
                    content!,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.w400,
                        fontSize: 18,
                        decoration: TextDecoration.none),
                  ),
                ],
                SizedBox(height: 24),
                ...actions
              ],
            ),
          ),
        ),
      ),
    );
  }
}
