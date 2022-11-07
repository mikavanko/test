import SortAdapter from "./Sort";
import FiltersAdapter from "./Filters";
import { map } from "lodash";

export default function (data) {
  return data
    ? {
        query: data.query ?? null,
        sort: SortAdapter(data.sort),
        page: data.page ?? null,
        per_page: data.perPage ?? null,
        fields: data.fields ?? null,
        limit: data.limit ?? null,
        filters: map(data.filters, FiltersAdapter) || [],
        title: data.title ?? null,
      }
    : null;
}
