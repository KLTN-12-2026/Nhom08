import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:trove/core/config/themes/app_colors.dart' as AppColors;
import 'package:trove/presentation/widgets/button/primary_button.dart';
import 'package:trove/presentation/widgets/custom_app_bar.dart';
import 'package:trove/presentation/widgets/input/primary_input.dart';
import '../../../core/config/themes/app_colors.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trove/core/services/service_provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:trove/models/category.dart';
import 'package:trove/presentation/widgets/tags/category_tag.dart';
import 'package:trove/presentation/widgets/tags/text_tag.dart';
import 'package:trove/presentation/widgets/dialogs/error_dialog.dart';
import 'package:trove/presentation/widgets/snackbar/app_snack.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:trove/data/response/plan/activity_groups_response.dart';

import 'package:trove/presentation/bloc/place/place_form/place_form_bloc.dart';
import 'package:trove/presentation/bloc/place/place_bloc.dart' as PlaceEvents;
import 'package:trove/presentation/bloc/api_mode/api_mode_bloc.dart';
import 'package:trove/core/config/api_mode.dart';
import 'package:trove/presentation/widgets/duplicate_check_widget.dart';
import 'package:trove/models/place.dart';
import '../place/location_picker_screen.dart';

class CreatePlaceScreen extends StatefulWidget {
  final List<File>? initialImages;
  const CreatePlaceScreen({Key? key, this.initialImages}) : super(key: key);

  @override
  State<CreatePlaceScreen> createState() => _CreatePlaceScreenState();
}

class _CreatePlaceScreenState extends State<CreatePlaceScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final FocusNode _nameFocusNode = FocusNode();
  final FocusNode _addressFocusNode = FocusNode();
  final FocusNode _priceFocusNode = FocusNode();
  final FocusNode _descriptionFocusNode = FocusNode();
  bool _isFormattingPrice = false;
  bool _isSyncingControllers = false;

  // Duplicate check state
  Timer? _duplicateCheckTimer;
  List<Place>? _duplicatePlaces;
  bool _isCheckingDuplicates = false;

  void _setupControllers(BuildContext context) {
    _nameController.addListener(() {
      if (!_isSyncingControllers && mounted) {
        context.read<PlaceFormBloc>().add(NameChanged(_nameController.text));

        // Duplicate check logic
        _duplicateCheckTimer?.cancel();
        final text = _nameController.text.trim();

        if (text.length >= 3) {
          setState(() {
            _isCheckingDuplicates = true;
          });

          // Debounce 500ms
          _duplicateCheckTimer = Timer(const Duration(milliseconds: 500), () {
            _checkForDuplicates(text);
          });
        } else {
          setState(() {
            _duplicatePlaces = null;
            _isCheckingDuplicates = false;
          });
        }
      }
    });

    _addressController.addListener(() {
      if (!_isSyncingControllers && mounted) {
        context
            .read<PlaceFormBloc>()
            .add(AddressChanged(_addressController.text));
      }
    });

    _priceController.addListener(() {
      if (_isFormattingPrice) return;

      final currentText = _priceController.text;
      final digits = _onlyDigits(currentText);

      // Format the digits
      final formatted = _formatPriceWithDots(digits);

      // Only update if formatted text is different
      if (formatted != currentText) {
        _isFormattingPrice = true;

        // Save cursor position before formatting
        final oldCursorPosition = _priceController.selection.baseOffset;

        // Count digits before cursor in original text
        final textBeforeCursor = currentText.substring(
            0, oldCursorPosition.clamp(0, currentText.length));
        final digitsBeforeCursor = _onlyDigits(textBeforeCursor).length;

        // Calculate new cursor position in formatted text
        int newCursorPosition = 0;
        int digitCount = 0;
        for (int i = 0; i < formatted.length; i++) {
          if (formatted[i] != '.') {
            digitCount++;
            if (digitCount > digitsBeforeCursor) {
              newCursorPosition = i;
              break;
            }
          }
          if (digitCount == digitsBeforeCursor) {
            newCursorPosition = i + 1;
            break;
          }
        }
        if (newCursorPosition == 0 && digitCount == digitsBeforeCursor) {
          newCursorPosition = formatted.length;
        }

        _isSyncingControllers = true;
        _priceController.value = TextEditingValue(
          text: formatted,
          selection: TextSelection.collapsed(
            offset: newCursorPosition.clamp(0, formatted.length),
          ),
        );
        _isSyncingControllers = false;
        _isFormattingPrice = false;
      }

      // Dispatch event to bloc
      if (!_isSyncingControllers && mounted) {
        context.read<PlaceFormBloc>().add(PriceChanged(_priceController.text));
      }
    });

    _descriptionController.addListener(() {
      if (!_isSyncingControllers && mounted) {
        context
            .read<PlaceFormBloc>()
            .add(DescriptionChanged(_descriptionController.text));
      }
    });

    _descriptionFocusNode.addListener(() {
      if (mounted) {
        context
            .read<PlaceFormBloc>()
            .add(DescriptionFocusChanged(_descriptionFocusNode.hasFocus));
      }
    });
  }

  @override
  void dispose() {
    _duplicateCheckTimer?.cancel();
    _nameController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    _priceController.dispose();
    _nameFocusNode.dispose();
    _addressFocusNode.dispose();
    _priceFocusNode.dispose();
    _descriptionFocusNode.dispose();
    super.dispose();
  }

  /// Check for duplicate places with similar names
  Future<void> _checkForDuplicates(String name) async {
    try {
      final places = await serviceProvider.placeService.getPlaces(
        page: 1,
        perPage: 5,
        searchQuery: name,
      );

      if (mounted) {
        setState(() {
          // Filter to only show places that actually contain the search term
          _duplicatePlaces = places
              .where((p) => p.name.toLowerCase().contains(name.toLowerCase()))
              .toList();
          _isCheckingDuplicates = false;
        });
      }
    } catch (e) {
      // Silently fail - don't show error to user for duplicate check
      if (mounted) {
        setState(() {
          _duplicatePlaces = null;
          _isCheckingDuplicates = false;
        });
      }
    }
  }

  void _showImageSourceDialog(BuildContext context, int index) {
    showModalBottomSheet(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.photo_library, color: primaryColor),
              title: const Text('Chọn từ thư viện'),
              onTap: () {
                Navigator.pop(sheetContext);
                context
                    .read<PlaceFormBloc>()
                    .pickImage(ImageSource.gallery, index);
              },
            ),
            ListTile(
              leading: Icon(Icons.camera_alt, color: primaryColor),
              title: const Text('Chụp ảnh mới'),
              onTap: () {
                Navigator.pop(sheetContext);
                context
                    .read<PlaceFormBloc>()
                    .pickImage(ImageSource.camera, index);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openMapForLocation(BuildContext context) async {
    final result = await Navigator.push<Map<String, dynamic>>(
      context,
      MaterialPageRoute(
        builder: (context) => const LocationPickerScreen(),
      ),
    );

    if (result != null) {
      _isSyncingControllers = true;
      _addressController.text = result['address'] ?? '';
      _isSyncingControllers = false;
      context.read<PlaceFormBloc>().add(LocationChanged(
            latitude: result['latitude'],
            longitude: result['longitude'],
            address: result['address'],
          ));
    }
  }

  Future<void> _getCurrentLocation(BuildContext context) async {
    try {
      // Kiểm tra quyền truy cập vị trí
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        context.error('Vui lòng bật dịch vụ vị trí');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          context.error('Quyền truy cập vị trí bị từ chối');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        context.error(
            'Quyền truy cập vị trí bị từ chối vĩnh viễn. Vui lòng cấp quyền trong cài đặt.');
        return;
      }

      // Lấy vị trí hiện tại
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Reverse geocoding để lấy địa chỉ
      final mapboxService = serviceProvider.mapboxService;
      final address = await mapboxService.getAddressFromCoordinates(
        position.longitude,
        position.latitude,
      );

      if (address != null) {
        _isSyncingControllers = true;
        _addressController.text = address;
        _isSyncingControllers = false;
        context.read<PlaceFormBloc>().add(LocationChanged(
              latitude: position.latitude,
              longitude: position.longitude,
              address: address,
            ));
      } else {
        context.error('Không thể lấy địa chỉ từ vị trí');
      }
    } catch (e) {
      context.error('Lỗi khi lấy vị trí: ${e.toString()}');
    }
  }

  Future<void> _promptCreateCategory(BuildContext context) async {
    final nameCtrl = TextEditingController();
    final displayCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();

    await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Thêm danh mục mới'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameCtrl,
                  decoration: InputDecoration(
                    labelText: 'Tên (key, ví dụ: CAFE)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: Colors.black, width: 2),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: borderPrimary),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: const BorderSide(color: Colors.red),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: const BorderSide(color: Colors.red, width: 2),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: borderPrimary),
                    ),
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Bắt buộc' : null,
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: displayCtrl,
                  decoration: InputDecoration(
                    labelText: 'Tên hiển thị',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: Colors.black, width: 2),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: borderPrimary),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: const BorderSide(color: Colors.red),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: const BorderSide(color: Colors.red, width: 2),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: borderPrimary),
                    ),
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? 'Bắt buộc' : null,
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: descCtrl,
                  decoration: InputDecoration(
                    labelText: 'Mô tả (không bắt buộc)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: Colors.black, width: 2),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: borderPrimary),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: const BorderSide(color: Colors.red),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: const BorderSide(color: Colors.red, width: 2),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide(color: borderPrimary),
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Huỷ'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;

                context.read<PlaceFormBloc>().add(CategoryCreated(
                      name: nameCtrl.text.trim(),
                      displayName: displayCtrl.text.trim(),
                      description: descCtrl.text.trim().isEmpty
                          ? null
                          : descCtrl.text.trim(),
                    ));

                Navigator.of(ctx).pop(true);
              },
              child: const Text('Tạo'),
            ),
          ],
        );
      },
    );
  }

  void _submit(BuildContext context) {
    if (!_formKey.currentState!.validate()) return;

    final state = context.read<PlaceFormBloc>().state;
    if (state is PlaceFormCategoriesLoaded) {
      final name = state.name.trim();
      final description = state.description.trim();
      final address = state.address.trim();
      final categories = state.selectedCategories;
      final rating = state.rating;
      final avgPrice = () {
        final raw = state.price.trim();
        if (raw.isEmpty) return null;
        final cleaned =
            raw.replaceAll('.', '').replaceAll(',', '').replaceAll(' ', '');
        final value = int.tryParse(cleaned);
        if (value == null) return null;
        // Database precision 15, scale 2: max value is 9999999999999.99
        // For int, max is 9999999999999 (13 digits)
        const maxPrice = 9999999999999;
        if (value > maxPrice) {
          context.error(
              'Giá không được vượt quá ${maxPrice.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} VND');
          return null;
        }
        return value;
      }();

      // Check if avgPrice validation failed
      if (state.price.trim().isNotEmpty && avgPrice == null) {
        return;
      }
      final images = state.selectedImages
          .where((file) => file != null)
          .cast<File>()
          .toList();

      // Validate rating
      if (rating <= 0) {
        context.error('Vui lòng chọn đánh giá');
        return;
      }

      context.read<PlaceFormBloc>().add(PlaceSubmitted(
            name: name,
            description: description,
            address: address,
            categories: categories,
            rating: rating,
            images: images,
            latitude: state.latitude,
            longitude: state.longitude,
            averagePrice: avgPrice,
          ));
    }
  }

  /// Fill random data for testing (Dev/Local mode only)
  void _fillRandomData(BuildContext context) {
    final random = DateTime.now().millisecondsSinceEpoch;

    // Fill basic info
    _isSyncingControllers = true;
    _nameController.text = 'Test Place $random';
    _addressController.text = '123 Test Street, Hanoi';
    _priceController.text = '150.000';
    _descriptionController.text =
        'This is a test place created for testing purposes. Location: Hanoi, Vietnam.';
    _isSyncingControllers = false;

    // Update bloc state
    context.read<PlaceFormBloc>()
      ..add(NameChanged(_nameController.text))
      ..add(AddressChanged(_addressController.text))
      ..add(PriceChanged(_priceController.text))
      ..add(DescriptionChanged(_descriptionController.text))
      ..add(const LocationChanged(
        latitude: 21.0285,
        longitude: 105.8542,
        address: '123 Test Street, Hanoi',
      ))
      ..add(const RatingChanged(4));

    // Select first 2 categories if available
    final state = context.read<PlaceFormBloc>().state;
    if (state is PlaceFormCategoriesLoaded) {
      final categories = state.categories;
      if (categories.isNotEmpty) {
        context.read<PlaceFormBloc>().add(CategorySelected(categories[0].name));
      }
      if (categories.length > 1) {
        context.read<PlaceFormBloc>().add(CategorySelected(categories[1].name));
      }
    }

    context.success('✅ Đã fill random data!');
  }

  String? _getPriceTierLabel(String priceText) {
    final raw = priceText.trim();
    if (raw.isEmpty) return null;
    final cleaned =
        raw.replaceAll('.', '').replaceAll(',', '').replaceAll(' ', '');
    final value = int.tryParse(cleaned);
    if (value == null) return null;
    if (value == 0) return 'Miễn phí';
    if (value > 500000) return 'Đại gia';
    if (value > 300000) return 'Vừa vừa';
    return 'Bình dân';
  }

  String _onlyDigits(String input) {
    final buf = StringBuffer();
    for (int i = 0; i < input.length; i++) {
      final ch = input.codeUnitAt(i);
      if (ch >= 48 && ch <= 57) {
        buf.writeCharCode(ch);
      }
    }
    return buf.toString();
  }

  String _formatPriceWithDots(String digits) {
    // Insert '.' as thousands separator from right to left
    final sb = StringBuffer();
    int count = 0;
    for (int i = digits.length - 1; i >= 0; i--) {
      sb.write(digits[i]);
      count++;
      if (count == 3 && i != 0) {
        sb.write('.');
        count = 0;
      }
    }
    return sb.toString().split('').reversed.join();
  }

  // Build activity group selection widget
  Widget _buildActivityGroupSelection({
    required BuildContext context,
    required PlaceFormCategoriesLoaded state,
  }) {
    final activityGroups = state.activityGroups;
    final selectedGroupId = state.selectedActivityGroupId;
    final isLoading = state.isLoadingActivityGroups;
    final error = state.activityGroupError;

    // Loading state
    if (isLoading) {
      return SizedBox(
        height: 40,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: 4,
          itemBuilder: (_, index) => Container(
            width: 90,
            margin: EdgeInsets.only(right: index == 3 ? 0 : 8),
            decoration: BoxDecoration(
              color: backgroundSecondary,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderPrimary),
            ),
          ),
        ),
      );
    }

    // Error state
    if (error != null) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.red.withOpacity(0.2)),
        ),
        child: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                error,
                style: TextStyle(
                  color: Colors.red.shade700,
                  fontSize: 12,
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                context.read<PlaceFormBloc>().add(const ActivityGroupsLoaded());
              },
              child: const Text('Thử lại'),
            ),
          ],
        ),
      );
    }

    // Empty state
    if (activityGroups.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: backgroundSecondary,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderPrimary),
        ),
        child: const Text(
          'Chưa có nhóm hoạt động',
          style: TextStyle(color: textSecondary, fontSize: 14),
        ),
      );
    }

    // Loaded state - show activity groups as chips
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          // Activity group chips
          ...activityGroups.map((group) {
            final isSelected = selectedGroupId == group.id;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: CategoryTag(
                text: group.displayName,
                isSelected: isSelected,
                onTap: () {
                  context
                      .read<PlaceFormBloc>()
                      .add(ActivityGroupSelected(group.id));
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  // Build category selection widget
  Widget _buildCategorySelection({
    required BuildContext context,
    required PlaceFormCategoriesLoaded state,
  }) {
    if (state.categories.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          icon: Icons.category_outlined,
          title: 'Danh mục',
          color: textSecondary,
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ...state.categories.map((category) {
              final isSelected = state.selectedCategories.contains(category.name);
              final canSelectMore = state.selectedCategories.length < 5 || isSelected;
              return CategoryTag(
                text: category.displayName,
                isSelected: isSelected,
                onTap: canSelectMore
                    ? () {
                        context
                            .read<PlaceFormBloc>()
                            .add(CategorySelected(category.name));
                      }
                    : () {
                        context.warning('Chỉ được chọn tối đa 5 danh mục');
                      },
              );
            }),
            // Chip "Thêm danh mục mới"
            InkWell(
              onTap: () => _promptCreateCategory(context),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: backgroundSecondary,
                  border: Border.all(color: Colors.black, width: 1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add, size: 14, color: primaryColor),
                    const SizedBox(width: 6),
                    const Text(
                      'Thêm danh mục mới',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        if (state.selectedCategories.isEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Vui lòng chọn ít nhất một danh mục',
              style: TextStyle(color: Colors.red.shade700, fontSize: 12),
            ),
          ),
      ],
    );
  }

  // Show category selection bottom sheet
  void _showCategoryBottomSheet({
    required BuildContext context,
    required List<Category> categories,
    required List<String> selectedCategories,
    required bool canSelectMore,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Chọn danh mục',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  Text(
                    '${selectedCategories.length}/5',
                    style: TextStyle(
                      fontSize: 14,
                      color: selectedCategories.length >= 5
                          ? Colors.orange[700]
                          : textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            // Category list
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: categories.length,
                itemBuilder: (listContext, index) {
                  final category = categories[index];
                  final isSelected = selectedCategories.contains(category.name);
                  final isDisabled = !isSelected && !canSelectMore;

                  return Theme(
                    data: ThemeData(
                      splashFactory: NoSplash.splashFactory,
                      highlightColor: Colors.transparent,
                    ),
                    child: ListTile(
                      onTap: isDisabled
                          ? null
                          : () {
                              context
                                  .read<PlaceFormBloc>()
                                  .add(CategorySelected(category.name));
                            },
                      leading: Checkbox(
                        value: isSelected,
                        onChanged: isDisabled
                            ? null
                            : (value) {
                                context
                                    .read<PlaceFormBloc>()
                                    .add(CategorySelected(category.name));
                              },
                        activeColor: primaryColor,
                      ),
                      title: Text(
                        category.displayName,
                        style: TextStyle(
                          fontSize: 16,
                          color: isDisabled ? Colors.grey : textColor,
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                      trailing: isDisabled
                          ? Text(
                              '(Tối đa 5)',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            )
                          : null,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final bloc = PlaceFormBloc(
          placeService: serviceProvider.placeService,
          categoryService: serviceProvider.categoryService,
          cloudinaryService: serviceProvider.cloudinaryService,
        );
        // Load categories sau khi bloc được tạo
        bloc.add(CategoriesLoaded());
        return bloc;
      },
      child: Builder(
        builder: (blocContext) {
          // Setup controllers after bloc is available
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              _setupControllers(blocContext);
            }
          });

          return BlocListener<PlaceFormBloc, PlaceFormState>(
            listener: (context, state) {
              if (state is PlaceFormSuccess) {
                context.success('Đăng địa điểm thành công!');
                // Refresh places list
                try {
                  context
                      .read<PlaceEvents.PlaceBloc>()
                      .add(const PlaceEvents.PlacesRefreshed());
                } catch (e) {
                  // PlaceBloc might not be available in context
                  print('PlaceBloc not available: $e');
                }
                // Pop back to camera screen with success result to clear shots
                if (Navigator.of(context).canPop()) {
                  Navigator.of(context).pop(true); // true indicates success
                } else {
                  // If can't pop (direct navigation), go to places
                  context.goNamed('places');
                }
              } else if (state is PlaceFormError) {
                showErrorDialog(context: context, message: state.message);
              } else if (state is PlaceFormCategoriesLoaded &&
                  state.activityGroups.isEmpty &&
                  !state.isLoadingActivityGroups &&
                  state.activityGroupError == null) {
                // Load activity groups when categories are loaded for the first time
                context.read<PlaceFormBloc>().add(const ActivityGroupsLoaded());
              }
            },
            child: BlocBuilder<PlaceFormBloc, PlaceFormState>(
              builder: (context, state) {
                // Check if loading categories (initial load or retry)
                final isLoading = state is PlaceFormLoading;
                final isError = state is PlaceFormError;
                final errorMessage = switch (state) {
                  PlaceFormError(:final message) => message,
                  _ => '',
                };
                final categoriesLoaded = state is PlaceFormCategoriesLoaded;
                final categoriesState = categoriesLoaded ? state : null;
                final categories = categoriesState?.categories ?? <Category>[];
                final selectedCategories =
                    categoriesState?.selectedCategories ?? <String>[];
                final selectedImages =
                    categoriesState?.selectedImages ?? <File?>[];

                // Sync controllers with bloc state
                if (categoriesLoaded && categoriesState != null) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    _isSyncingControllers = true;
                    if (_nameController.text != categoriesState.name) {
                      _nameController.text = categoriesState.name;
                    }
                    if (_addressController.text != categoriesState.address) {
                      _addressController.text = categoriesState.address;
                    }
                    if (_priceController.text != categoriesState.price) {
                      _priceController.text = categoriesState.price;
                    }
                    if (_descriptionController.text !=
                        categoriesState.description) {
                      _descriptionController.text = categoriesState.description;
                    }
                    if (_descriptionFocusNode.hasFocus !=
                        categoriesState.isDescriptionFocused) {
                      if (categoriesState.isDescriptionFocused) {
                        _descriptionFocusNode.requestFocus();
                      } else {
                        _descriptionFocusNode.unfocus();
                      }
                    }
                    _isSyncingControllers = false;
                  });
                }

                // Prefill images once if provided
                if (widget.initialImages != null &&
                    widget.initialImages!.isNotEmpty &&
                    categoriesLoaded &&
                    selectedImages.where((f) => f != null).isEmpty) {
                  final images = <File?>[...widget.initialImages!];
                  if (images.length < 10) images.add(null);
                  // Set initial images - using existing pattern
                  for (int i = 0; i < images.length; i++) {
                    if (images[i] != null) {
                      context.read<PlaceFormBloc>().add(ImageSelected(
                            imageFile: images[i]!,
                            index: i,
                          ));
                    }
                  }
                }

                return Scaffold(
                  appBar: CustomAppBar(
                    title: 'Đăng địa điểm',
                    backgroundColor: backgroundPrimary,
                    foregroundColor: textColor,
                    elevation: 0,
                    actions: [
                      // Random data button (Dev/Local only)
                      BlocBuilder<ApiModeBloc, ApiModeState>(
                        builder: (context, apiState) {
                          final isDev = apiState.currentMode == ApiMode.dev;
                          final isLocal = apiState.currentMode == ApiMode.local;

                          if (!isDev && !isLocal)
                            return const SizedBox.shrink();

                          return IconButton(
                            icon: const Icon(Icons.auto_awesome, size: 22),
                            tooltip: 'Fill Random Data (Test)',
                            onPressed: () => _fillRandomData(context),
                          );
                        },
                      ),
                    ],
                  ),
                  body: SafeArea(
                    child: Form(
                      key: _formKey,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Basic Information Section
                            _buildSectionHeader(
                              icon: Icons.info_outline,
                              title: 'Thông tin cơ bản',
                              subtitle: 'Chia sẻ địa điểm yêu thích của bạn với cộng đồng',
                              color: textSecondary,
                            ),
                            const SizedBox(height: 16),

                            // Place Name
                            PrimaryInput(
                              controller: _nameController,
                              hintText: 'Nhập tên địa điểm',
                              focusNode: _nameFocusNode,
                              textInputAction: TextInputAction.next,
                              onFieldSubmitted: (_) {
                                FocusScope.of(context)
                                    .requestFocus(_addressFocusNode);
                              },
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) {
                                  return 'Vui lòng nhập tên địa điểm';
                                }
                                final trimmed = v.trim();
                                if (trimmed.length < 3) {
                                  return 'Tên địa điểm phải có ít nhất 3 ký tự';
                                }
                                if (trimmed.length > 200) {
                                  return 'Tên địa điểm không được vượt quá 200 ký tự';
                                }
                                return null;
                              },
                            ),

                            // Duplicate check loading indicator
                            if (_isCheckingDuplicates)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Row(
                                  children: [
                                    SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                          Colors.orange.shade600,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Đang kiểm tra trùng lặp...',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.orange.shade700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                            // Duplicate warning widget
                            if (_duplicatePlaces != null &&
                                _duplicatePlaces!.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: DuplicateCheckWidget(
                                  places: _duplicatePlaces!,
                                  onDismiss: () =>
                                      setState(() => _duplicatePlaces = null),
                                ),
                              ),

                            const SizedBox(height: 12),

                            if (categoriesLoaded &&
                                categoriesState != null) ...[
                              _buildActivityGroupSelection(
                                context: context,
                                state: categoriesState,
                              ),
                              const SizedBox(height: 16),
                              _buildCategorySelection(
                                context: context,
                                state: categoriesState,
                              ),
                              const SizedBox(height: 16),
                            ],

                            // // Category Selection with Wrap and Dropdown
                            // // Show loading indicator when loading categories (as skeleton chips)
                            // if (isLoading || (!categoriesLoaded && !isError))
                            //   Wrap(
                            //     spacing: 8,
                            //     runSpacing: 8,
                            //     children: List.generate(3, (index) {
                            //       return Container(
                            //         padding: const EdgeInsets.symmetric(
                            //             horizontal: 12, vertical: 6),
                            //         decoration: BoxDecoration(
                            //           color: backgroundSecondary,
                            //           borderRadius: BorderRadius.circular(12),
                            //           border: Border.all(
                            //               color: Colors.black, width: 1),
                            //         ),
                            //         child: Row(
                            //           mainAxisSize: MainAxisSize.min,
                            //           children: [
                            //             SizedBox(
                            //               width: 12,
                            //               height: 12,
                            //               child: CircularProgressIndicator(
                            //                 strokeWidth: 1.5,
                            //                 valueColor:
                            //                     AlwaysStoppedAnimation<Color>(
                            //                         primaryColor),
                            //               ),
                            //             ),
                            //             const SizedBox(width: 6),
                            //             Container(
                            //               width: 60,
                            //               height: 14,
                            //               decoration: BoxDecoration(
                            //                 color: backgroundSecondary,
                            //                 borderRadius:
                            //                     BorderRadius.circular(4),
                            //               ),
                            //             ),
                            //           ],
                            //         ),
                            //       );
                            //     }),
                            //   )
                            // else if (categories.isNotEmpty)
                            //   Column(
                            //     crossAxisAlignment: CrossAxisAlignment.start,
                            //     children: [
                            //       // Wrap với 3 categories đầu tiên
                            //       Wrap(
                            //         spacing: 8,
                            //         runSpacing: 8,
                            //         children: [
                            //           // Hiển thị 3 categories đầu tiên dưới dạng TextTag
                            //           ...categories.take(3).map((category) {
                            //             final isSelected = selectedCategories
                            //                 .contains(category.name);
                            //             final canSelectMore =
                            //                 selectedCategories.length < 5 ||
                            //                     isSelected;
                            //             return CategoryTag(
                            //               text: category.displayName,
                            //               isSelected: isSelected,
                            //               onTap: canSelectMore
                            //                   ? () {
                            //                       context
                            //                           .read<PlaceFormBloc>()
                            //                           .add(CategorySelected(
                            //                               category.name));
                            //                     }
                            //                   : () {
                            //                       context.warning(
                            //                           'Chỉ được chọn tối đa 5 danh mục');
                            //                     },
                            //             );
                            //           }),
                            //           // TextTag "Khác..." với popup menu cho các categories còn lại
                            //           if (categories.length > 3)
                            //             Builder(
                            //               builder: (builderContext) {
                            //                 final otherCategories =
                            //                     categories.skip(3).toList();
                            //                 final selectedOtherCategories =
                            //                     otherCategories
                            //                         .where((c) =>
                            //                             selectedCategories
                            //                                 .contains(c.name))
                            //                         .toList();
                            //                 final hasSelectedOther =
                            //                     selectedOtherCategories
                            //                         .isNotEmpty;
                            //                 final canSelectMore =
                            //                     selectedCategories.length < 5;

                            //                 return GestureDetector(
                            //                   onTap: () {
                            //                     _showCategoryBottomSheet(
                            //                       context: builderContext,
                            //                       categories: otherCategories,
                            //                       selectedCategories:
                            //                           selectedCategories,
                            //                       canSelectMore: canSelectMore,
                            //                     );
                            //                   },
                            //                   child: CategoryTag(
                            //                     text: hasSelectedOther
                            //                         ? 'Khác... (${selectedOtherCategories.length})'
                            //                         : 'Khác...',
                            //                     isSelected: hasSelectedOther,
                            //                     onTap:
                            //                         null, // GestureDetector handles tap
                            //                   ),
                            //                 );
                            //               },
                            //             ),
                            //           // Chip "Thêm danh mục mới" nằm trong Wrap
                            //           InkWell(
                            //             onTap: () =>
                            //                 _promptCreateCategory(context),
                            //             borderRadius: BorderRadius.circular(12),
                            //             child: Container(
                            //               padding: const EdgeInsets.symmetric(
                            //                   horizontal: 12, vertical: 4),
                            //               decoration: BoxDecoration(
                            //                 color: backgroundSecondary,
                            //                 border: Border.all(
                            //                     color: Colors.black, width: 1),
                            //                 borderRadius:
                            //                     BorderRadius.circular(12),
                            //               ),
                            //               child: Row(
                            //                 mainAxisSize: MainAxisSize.min,
                            //                 children: [
                            //                   Icon(Icons.add,
                            //                       size: 14,
                            //                       color: primaryColor),
                            //                   const SizedBox(width: 6),
                            //                   const Text(
                            //                     'Thêm danh mục mới',
                            //                     style: TextStyle(
                            //                       fontSize: 12,
                            //                       fontWeight: FontWeight.w600,
                            //                       color: textColor,
                            //                     ),
                            //                   ),
                            //                 ],
                            //               ),
                            //             ),
                            //           ),
                            //         ],
                            //       ),
                            //       // Validator message
                            //       Builder(
                            //         builder: (context) {
                            //           final errorMessage =
                            //               _validateCategorySelection(
                            //                   selectedCategories);
                            //           if (errorMessage != null) {
                            //             return Padding(
                            //               padding:
                            //                   const EdgeInsets.only(top: 8),
                            //               child: Text(
                            //                 errorMessage,
                            //                 style: TextStyle(
                            //                   color: Colors.red,
                            //                   fontSize: 12,
                            //                 ),
                            //               ),
                            //             );
                            //           }
                            //           if (selectedCategories.length >= 5) {
                            //             return Padding(
                            //               padding:
                            //                   const EdgeInsets.only(top: 8),
                            //               child: Text(
                            //                 'Đã chọn tối đa 5 danh mục',
                            //                 style: TextStyle(
                            //                   color: Colors.orange[700],
                            //                   fontSize: 12,
                            //                 ),
                            //               ),
                            //             );
                            //           }
                            //           return const SizedBox.shrink();
                            //         },
                            //       ),
                            //     ],
                            //   )
                            // else
                            //   Container(
                            //     width: double.infinity,
                            //     padding: const EdgeInsets.all(8),
                            //     decoration: BoxDecoration(
                            //       border: Border.all(color: borderPrimary),
                            //       borderRadius: BorderRadius.circular(4),
                            //       color: backgroundSecondary,
                            //     ),
                            //     child: Text(
                            //       isError
                            //           ? 'Lỗi tải danh mục'
                            //           : 'Chưa có danh mục',
                            //       style: TextStyle(
                            //         color: textSecondary,
                            //         fontSize: 14,
                            //       ),
                            //     ),
                            //   ),
                            // // Add category button moved into Wrap above

                            // Show error message below category selection if loading categories failed
                            if (isError && !isLoading)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: Colors.red.withOpacity(0.3),
                                      width: 1,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(Icons.error_outline,
                                          color: Colors.red, size: 18),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          errorMessage,
                                          style: TextStyle(
                                            color: Colors.red[700],
                                            fontSize: 13,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                      TextButton(
                                        onPressed: () {
                                          // Manually retry loading categories
                                          context
                                              .read<PlaceFormBloc>()
                                              .add(CategoriesLoaded());
                                        },
                                        style: TextButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 12, vertical: 4),
                                          minimumSize: Size.zero,
                                          tapTargetSize:
                                              MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        child: Text(
                                          'Thử lại',
                                          style: TextStyle(
                                            color: Colors.red[700],
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            const SizedBox(height: 12),

                            // Address with map icon
                            PrimaryInput(
                              controller: _addressController,
                              hintText: 'Nhập địa chỉ',
                              focusNode: _addressFocusNode,
                              textInputAction: TextInputAction.next,
                              onFieldSubmitted: (_) {
                                FocusScope.of(context)
                                    .requestFocus(_priceFocusNode);
                              },
                              suffixIcon: IconButton(
                                tooltip: 'Lấy địa chỉ hiện tại',
                                onPressed: () => _getCurrentLocation(context),
                                icon: Icon(
                                  Icons.location_on,
                                  color: blackPrimary,
                                ),
                              ),
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) {
                                  return 'Vui lòng nhập địa chỉ';
                                }
                                final trimmed = v.trim();
                                if (trimmed.length < 5) {
                                  return 'Địa chỉ phải có ít nhất 5 ký tự';
                                }
                                if (trimmed.length > 500) {
                                  return 'Địa chỉ không được vượt quá 500 ký tự';
                                }
                                return null;
                              },
                            ),

                            // // Description Section
                            // _buildSectionHeader(
                            //   icon: Icons.edit_outlined,
                            //   title: 'Mô tả',
                            //   color: const Color(0xFF8B5CF6),
                            // ),
                            const SizedBox(height: 8),

                            // Average Price
                            IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(
                                    child: PrimaryInput(
                                      controller: _priceController,
                                      hintText: 'Giá trung bình (VND)',
                                      keyboardType: TextInputType.number,
                                      focusNode: _priceFocusNode,
                                      textInputAction: TextInputAction.next,
                                      onFieldSubmitted: (_) {
                                        FocusScope.of(context).requestFocus(
                                            _descriptionFocusNode);
                                      },
                                      suffixIcon: const Icon(Icons.attach_money,
                                          color: Colors.black),
                                      validator: (v) {
                                        if (v == null || v.trim().isEmpty) {
                                          return null; // optional
                                        }
                                        final cleaned = v
                                            .replaceAll('.', '')
                                            .replaceAll(',', '')
                                            .trim();
                                        final value = int.tryParse(cleaned);
                                        if (value == null || value < 0) {
                                          return 'Giá không hợp lệ';
                                        }
                                        // Database precision 15, scale 2: max value is 9999999999999.99
                                        // For int, max is 9999999999999 (13 digits)
                                        const maxPrice = 9999999999999;
                                        if (value > maxPrice) {
                                          return 'Giá không được vượt quá ${maxPrice.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} VND';
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                  Builder(builder: (context) {
                                    if (!categoriesLoaded) {
                                      return const SizedBox.shrink();
                                    }
                                    final label = _getPriceTierLabel(
                                        categoriesState!.price);
                                    if (label == null) {
                                      return const SizedBox.shrink();
                                    }
                                    return Container(
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryColor,
                                        border:
                                            Border.all(color: borderPrimary),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      padding: const EdgeInsets.only(left: 8),
                                      child: Center(
                                        child: TextTag(
                                          text: label,
                                          backgroundColor: primaryColor,
                                          textColor: Colors.black,
                                          fontWeight: FontWeight.w700,
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 4),
                                          borderRadius: 8,
                                          fontSize: 10,
                                          isSelected: true,
                                        ),
                                      ),
                                    );
                                  }),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),

                            // Price Suggestion Chips
                            SizedBox(
                              height: 32,
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                children: [
                                  _buildPriceChip(
                                      'Không tốn ngàn nào', 0, context),
                                  const SizedBox(width: 8),
                                  _buildPriceChip('50k', 50000, context),
                                  const SizedBox(width: 8),
                                  _buildPriceChip('100k', 100000, context),
                                  const SizedBox(width: 8),
                                  _buildPriceChip('200k', 200000, context),
                                  const SizedBox(width: 8),
                                  _buildPriceChip('500k', 500000, context),
                                  const SizedBox(width: 8),
                                  _buildPriceChip('1tr', 1000000, context),
                                  const SizedBox(width: 8),
                                  _buildPriceChip('2tr', 2000000, context),
                                ],
                              ),
                            ),

                            const SizedBox(height: 8),

                            // Description
                            GestureDetector(
                              onTap: () {
                                FocusScope.of(context)
                                    .requestFocus(_descriptionFocusNode);
                              },
                              child: PrimaryInput(
                                controller: _descriptionController,
                                hintText: 'Mô tả ngắn',
                                maxLines: 1,
                                focusNode: _descriptionFocusNode,
                                textInputAction: TextInputAction.done,
                                validator: (v) {
                                  if (v != null && v.trim().isNotEmpty) {
                                    final trimmed = v.trim();
                                    if (trimmed.length < 10) {
                                      return 'Mô tả phải có ít nhất 10 ký tự';
                                    }
                                    if (trimmed.length > 1000) {
                                      return 'Mô tả không được vượt quá 1000 ký tự';
                                    }
                                  }
                                  return null;
                                },
                              ),
                            ),

                            // Description Suggestions (show when focused)
                            if (categoriesLoaded &&
                                categoriesState!.isDescriptionFocused) ...[
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: [
                                  _buildDescriptionChip(
                                      'Không gian thoáng mát, view đẹp',
                                      context),
                                  _buildDescriptionChip(
                                      'Đồ ăn ngon, giá cả hợp lý', context),
                                  _buildDescriptionChip(
                                      'Phù hợp cho gia đình và bạn bè',
                                      context),
                                ],
                              ),
                            ],

                            const SizedBox(height: 8),

                            // Rating with stars
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: List.generate(5, (index) {
                                    final currentRating = categoriesLoaded
                                        ? categoriesState!.rating
                                        : 0.0;
                                    return GestureDetector(
                                      onTap: () {
                                        context
                                            .read<PlaceFormBloc>()
                                            .add(RatingChanged(index + 1.0));
                                      },
                                      child: FaIcon(
                                        index < currentRating
                                            ? FontAwesomeIcons.solidStar
                                            : FontAwesomeIcons.star,
                                        color: index < currentRating
                                            ? warningColor
                                            : textSecondary,
                                        size: 28,
                                      ),
                                    );
                                  }),
                                ),
                              ],
                            ),

                            const SizedBox(height: 8),

                            // Images Section
                            const Text(
                              'Chọn ảnh người ta mới biết mấy chế',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            // Builder(builder: (context) {
                            //   final tags = <String>[
                            //     'Tag 1',
                            //     'Tag 2',
                            //     'Tag 3',
                            //     'Tag 4',
                            //     'Tag 5'
                            //   ];
                            //   return Wrap(
                            //     spacing: 8,
                            //     runSpacing: 8,
                            //     children: tags.map((t) {
                            //       final selected = _selectedTags.contains(t);
                            //       return YellowSelectedTag(
                            //         text: t,
                            //         isSelected: selected,
                            //         onTap: () {
                            //           setState(() {
                            //             if (selected) {
                            //               _selectedTags.remove(t);
                            //             } else {
                            //               _selectedTags.add(t);
                            //             }
                            //           });
                            //         },
                            //       );
                            //     }).toList(),
                            //   );
                            // }),
                            // const SizedBox(height: 8),
                            // Responsive images grid using Wrap + dynamic tile size
                            Builder(builder: (context) {
                              final screenWidth =
                                  MediaQuery.of(context).size.width;
                              const horizontalPadding =
                                  16.0; // matches page padding
                              const gridSpacing = 12.0;
                              final usableWidth =
                                  screenWidth - (horizontalPadding * 2);
                              final crossAxisCount = screenWidth >= 600
                                  ? 4
                                  : (screenWidth >= 420 ? 3 : 2);
                              final baseTileSize = (usableWidth -
                                      gridSpacing * (crossAxisCount - 1)) /
                                  crossAxisCount;
                              // Make images half of the calculated base size
                              final tileSize = baseTileSize * 0.5;
                              return Wrap(
                                spacing: gridSpacing,
                                runSpacing: gridSpacing,
                                children: [
                                  // Show selected images
                                  ...selectedImages
                                      .where((file) => file != null)
                                      .map((file) {
                                    final index = selectedImages.indexOf(file);
                                    return GestureDetector(
                                      onTap: () {
                                        if (categoriesLoaded) {
                                          // Open image viewer for local files
                                          final allImagePaths = selectedImages
                                              .where((f) => f != null)
                                              .map((f) => f!.path)
                                              .toList();
                                          final currentImageIndex =
                                              allImagePaths.indexOf(file.path);

                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  _LocalImageViewScreen(
                                                imagePaths: allImagePaths,
                                                initialIndex: currentImageIndex,
                                              ),
                                            ),
                                          );
                                        }
                                      },
                                      child: Stack(
                                        children: [
                                          Container(
                                            width: tileSize,
                                            height: tileSize,
                                            decoration: BoxDecoration(
                                              border: Border.all(
                                                color: borderPrimary,
                                                width: 1,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              child: Image.file(
                                                file!,
                                                cacheWidth: tileSize.toInt(),
                                                cacheHeight: tileSize.toInt(),
                                                filterQuality:
                                                    FilterQuality.low,
                                                fit: BoxFit.cover,
                                              ),
                                            ),
                                          ),
                                          // Remove button (X)
                                          if (categoriesLoaded)
                                            Positioned(
                                              top: 4,
                                              right: 4,
                                              child: GestureDetector(
                                                onTap: () {
                                                  // Remove image
                                                  context
                                                      .read<PlaceFormBloc>()
                                                      .add(ImageRemoved(index));
                                                },
                                                child: Container(
                                                  width: 24,
                                                  height: 24,
                                                  decoration: BoxDecoration(
                                                    color: Colors.black
                                                        .withOpacity(0.7),
                                                    shape: BoxShape.circle,
                                                  ),
                                                  child: const Icon(
                                                    Icons.close,
                                                    color: Colors.white,
                                                    size: 16,
                                                  ),
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                    );
                                  }),

                                  // Add image button
                                  if (categoriesLoaded &&
                                      selectedImages
                                              .where((file) => file != null)
                                              .length <
                                          10)
                                    GestureDetector(
                                      onTap: () {
                                        final emptyIndex = selectedImages
                                            .indexWhere((file) => file == null);
                                        final targetIndex = emptyIndex != -1
                                            ? emptyIndex
                                            : selectedImages.length;

                                        if (targetIndex < 10) {
                                          if (targetIndex >=
                                              selectedImages.length) {
                                            context
                                                .read<PlaceFormBloc>()
                                                .add(ImageFieldAdded());
                                          }
                                          WidgetsBinding.instance
                                              .addPostFrameCallback((_) {
                                            _showImageSourceDialog(
                                                context, targetIndex);
                                          });
                                        }
                                      },
                                      child: Container(
                                        width: tileSize,
                                        height: tileSize,
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                              color: primaryColor,
                                              style: BorderStyle.solid),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          color: primaryColor,
                                        ),
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                                Icons
                                                    .add_photo_alternate_outlined,
                                                size: 30,
                                                color: textSecondary),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Thêm ảnh',
                                              style: TextStyle(
                                                  color: textSecondary,
                                                  fontSize: 10),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                ],
                              );
                            }),

                            const SizedBox(height: 32),

                            // Action Buttons
                            SizedBox(
                              width: double.infinity,
                              child: PrimaryButton(
                                onPressed: categoriesState?.isSubmitting == true
                                    ? null
                                    : () => _submit(context),
                                child: categoriesState?.isSubmitting == true
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2, color: white),
                                      )
                                    : const Text(
                                        'Đăng địa điểm',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          color: textColor,
                                        ),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader({
    required IconData icon,
    required String title,
    String? subtitle,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: primaryColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: textColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: textSecondary,
                      fontSize: 12,
                      height: 1.2,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceChip(String label, int value, BuildContext context) {
    return GestureDetector(
      onTap: () {
        _isSyncingControllers = true;
        _priceController.text = value.toString();
        _isSyncingControllers = false;
        context.read<PlaceFormBloc>().add(PriceChanged(value.toString()));
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: primaryColor, width: 1),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: textColor,
          ),
        ),
      ),
    );
  }

  Widget _buildDescriptionChip(String text, BuildContext context) {
    return GestureDetector(
      onTap: () {
        _isSyncingControllers = true;
        _descriptionController.text = text;
        _isSyncingControllers = false;
        context.read<PlaceFormBloc>().add(DescriptionChanged(text));
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.blue.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.blue, width: 1),
        ),
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: textColor,
          ),
        ),
      ),
    );
  }
}

// Local Image Viewer for File objects
class _LocalImageViewScreen extends StatefulWidget {
  final List<String> imagePaths;
  final int initialIndex;

  const _LocalImageViewScreen({
    Key? key,
    required this.imagePaths,
    this.initialIndex = 0,
  }) : super(key: key);

  @override
  State<_LocalImageViewScreen> createState() => _LocalImageViewScreenState();
}

class _LocalImageViewScreenState extends State<_LocalImageViewScreen> {
  late final PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex.clamp(0, widget.imagePaths.length - 1);
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              itemCount: widget.imagePaths.length,
              onPageChanged: (i) => setState(() => _currentIndex = i),
              itemBuilder: (context, index) {
                final path = widget.imagePaths[index];
                return InteractiveViewer(
                  minScale: 0.8,
                  maxScale: 4.0,
                  child: Center(
                    child: Image.file(
                      File(path),
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stack) => const Icon(
                        Icons.broken_image,
                        size: 64,
                        color: Colors.white54,
                      ),
                    ),
                  ),
                );
              },
            ),

            // Close button
            Positioned(
              top: 12,
              right: 12,
              child: Material(
                color: Colors.black54,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: () => Navigator.of(context).pop(),
                  child: const SizedBox(
                    width: 40,
                    height: 40,
                    child: Center(
                      child: FaIcon(
                        FontAwesomeIcons.xmark,
                        color: AppColors.white,
                        size: 18,
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Index indicator
            Positioned(
              bottom: 16,
              right: 0,
              left: 0,
              child: Center(
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_currentIndex + 1} / ${widget.imagePaths.length}',
                    style: const TextStyle(
                        color: AppColors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
