import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:trove/core/config/themes/app_colors.dart';
import 'package:trove/presentation/bloc/place/place_bloc.dart';
import 'package:trove/presentation/screen/place/widgets/filter/filter_model.dart';
import 'package:trove/presentation/screen/place/widgets/filter/filter_sheet.dart';

class PlaceSearchBar extends StatefulWidget {
  final PlaceState state;

  const PlaceSearchBar({
    super.key,
    required this.state,
  });

  @override
  State<PlaceSearchBar> createState() => _PlaceSearchBarState();
}

class _PlaceSearchBarState extends State<PlaceSearchBar> {
  late final TextEditingController _controller;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    final initialQuery = widget.state is PlacesLoaded
        ? (widget.state as PlacesLoaded).searchQuery ?? ''
        : '';
    _controller = TextEditingController(text: initialQuery);
    _hasText = initialQuery.isNotEmpty;

    // Listen to text changes to show/hide clear button
    _controller.addListener(() {
      final hasText = _controller.text.isNotEmpty;
      if (hasText != _hasText) {
        setState(() {
          _hasText = hasText;
        });
      }
    });
  }

  @override
  void didUpdateWidget(PlaceSearchBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Only update controller if search was cleared externally (e.g., filter reset)
    final newQuery = widget.state is PlacesLoaded
        ? (widget.state as PlacesLoaded).searchQuery ?? ''
        : '';
    if (_controller.text != newQuery && newQuery.isEmpty) {
      _controller.text = newQuery;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
        child: TextField(
          controller: _controller,
          onTapOutside: (_) => FocusScope.of(context).unfocus(),
          decoration: InputDecoration(
            hintText: 'Tìm kiếm địa điểm...',
            prefixIcon: const Icon(Icons.search, color: textSecondary),
            filled: true,
            fillColor: backgroundSecondary,
            contentPadding: const EdgeInsets.symmetric(vertical: 0),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(4),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(4),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(4),
              borderSide: const BorderSide(color: blackPrimary, width: 1.5),
            ),
            suffixIcon: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Clear button - only show when text exists
                if (_hasText)
                  GestureDetector(
                    onTap: () {
                      _controller.clear();
                      context.read<PlaceBloc>().add(const SearchChanged(''));
                    },
                    child: Icon(
                      Icons.clear,
                      size: 20,
                      color: textSecondary,
                    ),
                  ),
                // Filter button - always visible
                IconButton(
                  tooltip: 'Bộ lọc',
                  onPressed: () => _showFilterSheet(context, widget.state),
                  icon: const FaIcon(FontAwesomeIcons.sliders, size: 16),
                  color: textColor,
                ),
              ],
            ),
          ),
          onChanged: (query) {
            context.read<PlaceBloc>().add(SearchChanged(query));
          },
        ),
      ),
    );
  }

  void _showFilterSheet(BuildContext context, PlaceState state) {
    FilterOptions? currentFilters;
    if (state is PlacesLoaded) {
      currentFilters = state.activeFilters ??
          (state.selectedCategoryId != null
              ? FilterOptions(selectedCategoryId: state.selectedCategoryId)
              : null);
    }

    final placeBloc = context.read<PlaceBloc>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return BlocProvider.value(
          value: placeBloc,
          child: SizedBox(
            height: MediaQuery.of(sheetContext).size.height * 3 / 4,
            child: FilterSortSheet(
              initialFilters: currentFilters,
              onApplyFilters: (filters) {
                placeBloc.add(FilterApplied(filters));
              },
            ),
          ),
        );
      },
    );
  }
}
