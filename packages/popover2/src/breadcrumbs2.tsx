/*
 * Copyright 2022 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from "classnames";
import * as React from "react";

import {
    AbstractPureComponent2,
    Boundary,
    Breadcrumb,
    BreadcrumbProps,
    Classes as CoreClasses,
    Menu,
    OverflowList,
    OverflowListProps,
    Props,
    removeNonHTMLProps,
} from "@blueprintjs/core";

import { MenuItem2 } from "./menuItem2";
import { Popover2, Popover2Props } from "./popover2";

export { BreadcrumbProps };
export interface Breadcrumbs2Props extends Props {
    /**
     * Callback invoked to render visible breadcrumbs. Best practice is to
     * render a `<Breadcrumb>` element. If `currentBreadcrumbRenderer` is also
     * supplied, that callback will be used for the current breadcrumb instead.
     *
     * @default Breadcrumb
     */
    breadcrumbRenderer?: (props: BreadcrumbProps) => JSX.Element;

    /**
     * Which direction the breadcrumbs should collapse from: start or end.
     *
     * @default Boundary.START
     */
    collapseFrom?: Boundary;

    /**
     * Callback invoked to render the current breadcrumb, which is the last
     * element in the `items` array.
     *
     * If this prop is omitted, `breadcrumbRenderer` will be invoked for the
     * current breadcrumb instead.
     */
    currentBreadcrumbRenderer?: (props: BreadcrumbProps) => JSX.Element;

    /**
     * All breadcrumbs to display. Breadcrumbs that do not fit in the container
     * will be rendered in an overflow menu instead.
     */
    items: readonly BreadcrumbProps[];

    /**
     * The minimum number of visible breadcrumbs that should never collapse into
     * the overflow menu, regardless of DOM dimensions.
     *
     * @default 0
     */
    minVisibleItems?: number;

    /**
     * Props to spread to `OverflowList`. Note that `items`,
     * `overflowRenderer`, and `visibleItemRenderer` cannot be changed.
     */
    overflowListProps?: Partial<
        Omit<OverflowListProps<BreadcrumbProps>, "items" | "overflowRenderer" | "visibleItemRenderer">
    >;

    /**
     * Props to spread to the popover showing the overflow menu.
     */
    popoverProps?: Partial<
        Omit<Popover2Props, "content" | "defaultIsOpen" | "disabled" | "fill" | "renderTarget" | "targetTagName">
    >;
}

export class Breadcrumbs2 extends AbstractPureComponent2<Breadcrumbs2Props> {
    public static defaultProps: Partial<Breadcrumbs2Props> = {
        collapseFrom: Boundary.START,
    };

    public render() {
        const { className, collapseFrom, items, minVisibleItems, overflowListProps = {} } = this.props;
        return (
            <OverflowList
                collapseFrom={collapseFrom}
                minVisibleItems={minVisibleItems}
                tagName="ul"
                {...overflowListProps}
                className={classNames(CoreClasses.BREADCRUMBS, overflowListProps.className, className)}
                items={items}
                overflowRenderer={this.renderOverflow}
                visibleItemRenderer={this.renderBreadcrumbWrapper}
            />
        );
    }

    private renderOverflow = (items: readonly BreadcrumbProps[]) => {
        const { collapseFrom, popoverProps } = this.props;

        let orderedItems = items;
        if (collapseFrom === Boundary.START) {
            // If we're collapsing from the start, the menu should be read from the bottom to the
            // top, continuing with the breadcrumbs to the right. Since this means the first
            // breadcrumb in the props must be the last in the menu, we need to reverse the overlow
            // order.
            orderedItems = items.slice().reverse();
        }

        return (
            <li>
                <Popover2
                    placement={collapseFrom === Boundary.END ? "bottom-end" : "bottom-start"}
                    disabled={orderedItems.length === 0}
                    content={<Menu>{orderedItems.map(this.renderOverflowBreadcrumb)}</Menu>}
                    {...popoverProps}
                >
                    <span className={CoreClasses.BREADCRUMBS_COLLAPSED} />
                </Popover2>
            </li>
        );
    };

    private renderOverflowBreadcrumb = (props: BreadcrumbProps, index: number) => {
        const isClickable = props.href != null || props.onClick != null;
        const htmlProps = removeNonHTMLProps(props);
        return <MenuItem2 disabled={!isClickable} {...htmlProps} text={props.text} key={index} />;
    };

    private renderBreadcrumbWrapper = (props: BreadcrumbProps, index: number) => {
        const isCurrent = this.props.items[this.props.items.length - 1] === props;
        return <li key={index}>{this.renderBreadcrumb(props, isCurrent)}</li>;
    };

    private renderBreadcrumb(props: BreadcrumbProps, isCurrent: boolean) {
        if (isCurrent && this.props.currentBreadcrumbRenderer != null) {
            return this.props.currentBreadcrumbRenderer(props);
        } else if (this.props.breadcrumbRenderer != null) {
            return this.props.breadcrumbRenderer(props);
        } else {
            // allow user to override 'current' prop
            return <Breadcrumb current={isCurrent} {...props} />;
        }
    }
}
