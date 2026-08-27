import { TetrominoType } from 'shared';

export interface PieceSpawnCoordinates {
  readonly spawnColumn: number;
  readonly spawnRow: number;
}

export class Piece {
  private readonly pieceType: TetrominoType;
  private rotationIndex: number;
  private readonly spawnColumn: number;
  private readonly spawnRow: number;

  constructor(
    pieceType: TetrominoType,
    spawnCoordinates: PieceSpawnCoordinates,
    initialRotationIndex = 0,
  ) {
    this.pieceType = pieceType;
    this.spawnColumn = spawnCoordinates.spawnColumn;
    this.spawnRow = spawnCoordinates.spawnRow;
    this.rotationIndex = normalizeRotationIndex(initialRotationIndex);
  }

  getPieceType(): TetrominoType {
    return this.pieceType;
  }

  getRotationIndex(): number {
    return this.rotationIndex;
  }

  getSpawnCoordinates(): PieceSpawnCoordinates {
    return { spawnColumn: this.spawnColumn, spawnRow: this.spawnRow };
  }

  setRotationIndex(nextRotationIndex: number): void {
    this.rotationIndex = normalizeRotationIndex(nextRotationIndex);
  }
}

function normalizeRotationIndex(rotationIndex: number): number {
  const rotationStateCount = 4;
  return ((rotationIndex % rotationStateCount) + rotationStateCount) % rotationStateCount;
}
