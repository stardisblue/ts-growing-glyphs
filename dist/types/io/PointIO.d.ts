import { QuadTree } from '../datastructure/QuadTree';
import { File } from '../java/File';
export declare class PointIO {
    private static readonly LOGGER;
    static read(file: File, tree: QuadTree): Promise<number>;
    static write(tree: QuadTree, file: File): void;
}
//# sourceMappingURL=PointIO.d.ts.map