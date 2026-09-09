import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { SingleList, DateRange, MultiList } from "@appbaseio/reactivesearch";

// NOTE: deliberately no renderError on these lists. reactivesearch returns it INSTEAD of
// the control (MultiList/SingleList: `if (renderError && error) return renderError(error)`),
// and `state.options` survives a failed refresh -- so a single transient aggregation
// failure would replace a still-usable facet, checked boxes and all, with a notice, while
// its selection carried on filtering the results. That leaves no way to clear the filter
// short of reloading the page, which is the trap this whole change exists to remove.
// Failures that matter (the results query) are reported by the status bar instead.

import "./style.css";

function Filter({
  componentId,
  dataField,
  title,
  type,
  sortBy,
  defaultValue,
  size,
  queryLogic,
  // Any other key on a FILTERS entry is forwarded verbatim to the underlying
  // reactivesearch component. The props named above are destructured out, so a
  // config entry cannot clobber them; `{...rest}` is spread first for the same
  // reason, leaving this component's own wiring authoritative.
  ...rest
}) {
  const _queryLogic = useMemo(
    () =>
      queryLogic && queryLogic.constructor === Object
        ? Object.entries(queryLogic).reduce(
            (o, [k, v]) => ({ ...o, [k]: v.filter((d) => d !== componentId) }),
            {}
          )
        : queryLogic,
    []
  );

  switch (type) {
    case "multi":
      return (
        <MultiList
          {...rest}
          componentId={componentId}
          key={componentId}
          dataField={dataField}
          title={title}
          URLParams={true}
          sortBy={sortBy}
          size={size || 1000}
          defaultValue={null || defaultValue}
          react={_queryLogic}
          className="reactivesearch-input reactivesearch-multilist"
        />
      );
    case "date":
      return (
        <DateRange
          {...rest}
          componentId={componentId}
          key={componentId}
          title={title}
          dataField={dataField}
          URLParams={true}
          className="reactivesearch-input reactivesearch-date"
        />
      );
    case "bool":
    case "boolean":
      return (
        <SingleList
          {...rest}
          componentId={componentId}
          key={componentId}
          dataField={dataField}
          title={title}
          URLParams={true}
          react={_queryLogic}
          className="reactivesearch-input"
          transformData={(list) =>
            list
              .filter((d) => d.key === 1 || d.key === 0)
              .map((d) => ({
                key: d.key_as_string,
                doc_count: d.doc_count,
              }))
          }
        />
      );
    case "single":
    default:
      return (
        <SingleList
          {...rest}
          componentId={componentId}
          key={componentId}
          dataField={dataField}
          title={title}
          URLParams={true}
          sortBy={sortBy}
          size={size || 1000}
          defaultValue={null || defaultValue}
          react={_queryLogic}
          className="reactivesearch-input"
        />
      );
  }
}

function SidebarFilters({ filters, queryLogic }) {
  return filters.map((filter) => (
    <Filter key={filter.componentId} queryLogic={queryLogic} {...filter} />
  ));
}

SidebarFilters.propTypes = {
  filters: PropTypes.array.isRequired,
  queryLogic: PropTypes.object,
};

SidebarFilters.defaultProps = {
  filters: [],
  queryLogic: null,
};

export default SidebarFilters;
