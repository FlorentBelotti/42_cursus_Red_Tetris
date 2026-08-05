import { TetrominoType } from 'shared/src/game_rules/tetromino_type_enum';

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

  /**
   * Records a rotation of this piece. Wrapping and validity are decided by
   * the client-side pure rotation resolver; this only stores the resulting
   * index so the server's view of the piece stays in sync.
   *
   * @param nextRotationIndex - The new rotation state index, any integer.
   */
  setRotationIndex(nextRotationIndex: number): void {
    this.rotationIndex = normalizeRotationIndex(nextRotationIndex);
  }
}

/**
 * Wraps a rotation index into the valid 0-3 range, so it always denotes one
 * of the four rotation states in tetromino_shape_definitions.ts.
 */
function normalizeRotationIndex(rotationIndex: number): number {
  const rotationStateCount = 4;
  return ((rotationIndex % rotationStateCount) + rotationStateCount) % rotationStateCount;
}
