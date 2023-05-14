import React, { ReactElement, useMemo, useCallback } from 'react';
import {
  ListRenderItem,
  ViewStyle,
  StyleProp,
  useWindowDimensions,
  FlatList,
  View,
  ViewToken,
  ViewabilityConfig,
  FlatListProps,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import AnimateWrapper, { TimelineAnimationConfig } from './AnimateWrapper';
import DateDivider from './DateDivider';
import TimelineLabel from './TimelineLabel';
import TimelineLabelContents from './TimelineLabelContents';
import TimelineVerticalLine from './TimelineVerticalLine';

export interface TimelineItem {
  date: Date | string;
}

export type TimelineInjectDividerBy = 'never' | 'day' | 'month' | 'year';

export type TimelineSortDateBy = 'desc' | 'asc';

export interface TimelineItemSizeConfig {
  item: number;
  divider: number;
}

export interface TimelineProps<T>
  extends Omit<
      FlatListProps<T>,
      | 'renderItem'
      | 'data'
      | 'horizontal'
      | 'viewabilityConfig'
      | 'keyExtractor'
      | 'getItemLayout'
    >,
    ViewabilityConfig {
  data: T[];

  /**
   * sort data by date
   * @default 'desc'
   */
  sortDateBy?: TimelineSortDateBy;

  /**
   * when to inject divider comparing previous item
   * @default 'month'
   */
  injectDividerBy?: TimelineInjectDividerBy;

  /**
   * ref callback
   */
  refCallback?: (ref: FlatList<any>) => void;

  /**
   * renderDivider function
   */
  renderDivider?: (date: Date) => ReactElement;

  /**
   * renderLabel function
   */
  renderLabel?: (data: T) => ReactElement;

  /**
   * renderItem function
   */
  renderItem: ListRenderItem<T>;

  /**
   * style for each item
   */
  itemContainerStyle?: StyleProp<ViewStyle>;

  /**
   * for rendering optimization
   * exact size of item & divider
   */
  itemSizeForOptimization?: TimelineItemSizeConfig;

  /**
   * line color in hex
   * @default '#d8dee4'
   */
  lineColor?: string;

  /**
   * line thickness in px
   * @default 2px
   */
  lineThickness?: number;

  /**
   * label area contents width
   * @default '20%''
   */
  labelContentsWidth?: string | number;

  /**
   * label size
   *
   * @default '10%'
   */
  labelSize?: string | number;

  /**
   * label top offset in px
   */
  labelTopOffset?: number;

  /**
   * gap between label and item
   * @default 4px
   */
  labelPadding?: number;

  /**
   * label padding color
   * @default #ffffff
   */
  labelPaddingColor?: string;

  /**
   * animation configuration
   */
  animationConfig?: TimelineAnimationConfig;
}

function Timeline<T extends TimelineItem>({
  data,
  injectDividerBy = 'month',
  sortDateBy = 'asc',
  renderDivider,
  renderItem: renderTimelineItem,
  renderLabel,
  itemContainerStyle,
  itemSizeForOptimization,
  lineThickness = 2,
  lineColor = '#d8dee4',
  labelContentsWidth = '20%',
  labelSize = '10%',
  labelTopOffset = 10,
  labelPadding = 4,
  labelPaddingColor = '#ffffff',
  onViewableItemsChanged,
  itemVisiblePercentThreshold,
  waitForInteraction,
  minimumViewTime,
  animationConfig,
  refCallback,
  ...props
}: TimelineProps<T>) {
  const items: (T | Date)[] = useMemo(
    () => generateTimelineItems(data, injectDividerBy, sortDateBy),
    [data, sortDateBy, injectDividerBy],
  );

  const sharedViewItems = useSharedValue<ViewToken[]>([]);

  const { width } = useWindowDimensions();

  const renderItem: ListRenderItem<T | Date> = useCallback(
    ({ item, ...info }) => {
      // when item is Date
      if (item instanceof Date) {
        return (
          <AnimateWrapper
            {...animationConfig}
            height={itemSizeForOptimization?.divider}
            index={info.index}
            sharedViewableItems={sharedViewItems}>
            <TimelineVerticalLine
              labelContentsWidth={labelContentsWidth}
              lineColor={lineColor}
              lineThickness={lineThickness}
            />
            {renderDivider ? (
              renderDivider(item)
            ) : (
              <DateDivider
                height={itemSizeForOptimization?.divider}
                date={item}
                lineColor={lineColor}
                lineThickness={lineThickness}
              />
            )}
          </AnimateWrapper>
        );
      }

      // when item is T
      return (
        <AnimateWrapper
          {...animationConfig}
          height={itemSizeForOptimization?.item}
          index={info.index}
          sharedViewableItems={sharedViewItems}>
          <TimelineLabelContents
            lineColor={lineColor}
            labelContentsWidth={labelContentsWidth}
            lineThickness={lineThickness}
            labelSize={labelSize}
            labelTopOffset={labelTopOffset}>
            <TimelineLabel
              size={labelSize}
              paddingColor={labelPaddingColor}
              padding={labelPadding}>
              {renderLabel ? (
                renderLabel(item)
              ) : (
                <View
                  style={{
                    backgroundColor: lineColor,
                    width: '100%',
                    height: '100%',
                    borderRadius: width,
                  }}
                />
              )}
            </TimelineLabel>
          </TimelineLabelContents>
          {renderTimelineItem({ ...info, item })}
        </AnimateWrapper>
      );
    },
    [
      sortDateBy,
      injectDividerBy,
      renderTimelineItem,
      renderDivider,
      renderLabel,
      itemContainerStyle,
      lineColor,
      lineThickness,
      labelContentsWidth,
      labelSize,
      labelTopOffset,
      labelPaddingColor,
      labelPadding,
    ],
  );

  const keyExtractor = useCallback((item: T | Date, index: number) => {
    if (item instanceof Date) return `${item.getTime()}-${index}`;
    return `${
      typeof item.date === 'string' ? item.date : item.date.getTime()
    }-${index}`;
  }, []);

  const getItemLayout: FlatListProps<T | Date>['getItemLayout'] = useCallback(
    (data: (T | Date)[] | null | undefined, index: number) => {
      if (!itemSizeForOptimization) {
        throw new Error(
          '[react-native-awesome-timeline] this should never happen',
        );
      }

      const currentItem = items[index];

      const { divider, item } = itemSizeForOptimization;

      const offset: number =
        data?.reduce<number>((acc, curr, idx) => {
          return (
            acc + (idx <= index ? (curr instanceof Date ? divider : item) : 0)
          );
        }, 0) || 0;

      return {
        length: currentItem instanceof Date ? divider : item,
        offset,
        index,
      };
    },
    [!!itemSizeForOptimization],
  );

  return (
    <FlatList
      {...props}
      ref={refCallback}
      horizontal={false}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onViewableItemsChanged={(event) => {
        sharedViewItems.value = event.viewableItems;
        onViewableItemsChanged && onViewableItemsChanged(event);
      }}
      getItemLayout={itemSizeForOptimization ? getItemLayout : undefined}
      viewabilityConfig={{
        itemVisiblePercentThreshold: itemVisiblePercentThreshold ?? 10,
        waitForInteraction: waitForInteraction ?? false,
        minimumViewTime: minimumViewTime ?? 0,
      }}
    />
  );
}

export function generateTimelineItems<T extends { date: Date | string }>(
  items: T[],
  divideBy: TimelineInjectDividerBy,
  sortBy: TimelineSortDateBy,
): (T | Date)[] {
  const sorted = items
    .map((v) => ({ ...v, date: new Date(v.date) }))
    .sort((l, r) => {
      if (sortBy === 'asc') {
        return l.date.getTime() - r.date.getTime();
      }
      return l.date.getTime() - r.date.getTime();
    });

  if (divideBy === 'never') return sorted;

  return sorted.reduce<(T | Date)[]>((acc, currItem, index) => {
    const prevItem = sorted[index - 1];

    return isSameBy({
      date: currItem.date,
      prevDate: prevItem?.date,
      compareBy: divideBy,
    })
      ? [...acc, currItem]
      : [...acc, new Date(currItem.date), currItem];
  }, []);
}

export function isSameBy({
  date,
  prevDate,
  compareBy,
}: {
  date: Date;
  prevDate: Date | undefined;
  compareBy: TimelineInjectDividerBy;
}): boolean {
  if (!prevDate) return false;

  if (compareBy === 'day') {
    return (
      date.getFullYear() === prevDate.getFullYear() &&
      date.getMonth() === prevDate.getMonth() &&
      date.getDate() === prevDate.getDate()
    );
  }

  if (compareBy === 'month') {
    return (
      date.getFullYear() === prevDate.getFullYear() &&
      date.getMonth() === prevDate.getMonth()
    );
  }

  if (compareBy === 'year') {
    return date.getFullYear() === prevDate.getFullYear();
  }

  // never
  return false;
}

export const MemoizedTimeline = React.memo(Timeline) as typeof Timeline;

export default Timeline;
