import { QuadTree } from './QuadTree';

export class QuadTreeClusterer {
  tree: QuadTree;
  result: null;
  rec: null;
  constructor(tree: QuadTree) {
    this.tree = tree;
    this.result = null;
    this.rec = null;
  }

  cluster() {
    throw new Error('To implement');
  }
}
