export const deepCopy = <T>(data: T): T => {
  let node: any;

  if (Array.isArray(data)) {
    node = data.length > 0 ? data.slice(0) : [];
    (node as unknown[]).forEach((e, i) => {
      if (
        (typeof e === 'object' && e !== {}) ||
        (Array.isArray(e) && e.length > 0)
      ) {
        node[i] = deepCopy(e);
      }
    });
  } else if (data && typeof data === 'object') {
    node = data instanceof Date ? data : Object.assign({}, data);
    Object.keys(node).forEach((key) => {
      if (
        (typeof node[key] === 'object' && node[key] !== {}) ||
        (Array.isArray(node[key]) && node[key].length > 0)
      ) {
        node[key] = deepCopy(node[key]);
      }
    });
  } else {
    node = data;
  }
  return node as T;
};
