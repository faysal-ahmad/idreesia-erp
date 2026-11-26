import type { ExtraLocationOption, PickerLocation } from './types';

export interface LocationTreeNode {
  value: string;
  title: string;
  locationType?: string | null;
  selectable: boolean;
  children: LocationTreeNode[];
}

/**
 * Builds the picker tree from a flat list of locations. A location whose parent
 * is not in the list becomes a root. Nodes are sorted by name, and only those
 * isSelectable allows can be picked; the rest stay for context.
 */
export function buildLocationTree(
  locations: PickerLocation[],
  isSelectable: (location: PickerLocation) => boolean,
  extraOptions: ExtraLocationOption[] = []
): LocationTreeNode[] {
  const nodes = new Map<string, LocationTreeNode>(
    locations.map(location => [
      location._id,
      {
        value: location._id,
        title: location.name ?? '',
        locationType: location.type,
        selectable: isSelectable(location),
        children: [],
      },
    ])
  );

  const roots: LocationTreeNode[] = [];
  locations.forEach(location => {
    const node = nodes.get(location._id)!;
    const parent = location.parentId ? nodes.get(location.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const sortTree = (list: LocationTreeNode[]) => {
    list.sort((a, b) => a.title.localeCompare(b.title));
    list.forEach(node => sortTree(node.children));
  };
  sortTree(roots);

  extraOptions.forEach(option =>
    roots.push({ ...option, selectable: true, children: [] })
  );
  return roots;
}
