import { keccak256, toUtf8Bytes, getBytes } from 'ethers';

export interface MerkleProofResult {
  root: string;
  leaf: string;
  proof: string[];
  isEligible: boolean;
}

/**
 * Hash a voter address into a leaf node
 */
export function hashVoter(address: string): string {
  const normalized = address.toLowerCase();
  return keccak256(toUtf8Bytes(normalized));
}

/**
 * Combined hash of two leaf/internal nodes in sorted order (standard OpenZeppelin MerkleProof)
 */
export function combineHash(a: string, b: string): string {
  const [first, second] = a < b ? [a, b] : [b, a];
  const combined = first.slice(2) + second.slice(2);
  return keccak256('0x' + combined);
}

/**
 * Build a simple Merkle Tree from a list of voter addresses
 */
export class SimpleMerkleTree {
  leaves: string[];
  layers: string[][];
  addresses: string[];

  constructor(addresses: string[]) {
    this.addresses = addresses.map((a) => a.toLowerCase());
    this.leaves = this.addresses.map((a) => hashVoter(a));
    this.layers = [this.leaves];

    // Build layers up to root
    let currentLayer = this.leaves;
    if (currentLayer.length === 0) {
      this.layers = [['0x' + '0'.repeat(64)]];
    } else {
      while (currentLayer.length > 1) {
        const nextLayer: string[] = [];
        for (let i = 0; i < currentLayer.length; i += 2) {
          if (i + 1 < currentLayer.length) {
            nextLayer.push(combineHash(currentLayer[i], currentLayer[i + 1]));
          } else {
            // Odd element is promoted to next layer
            nextLayer.push(currentLayer[i]);
          }
        }
        this.layers.push(nextLayer);
        currentLayer = nextLayer;
      }
    }
  }

  getRoot(): string {
    if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
      return '0x' + '0'.repeat(64);
    }
    return this.layers[this.layers.length - 1][0];
  }

  getProof(address: string): string[] {
    const targetLeaf = hashVoter(address);
    let index = this.leaves.indexOf(targetLeaf);
    if (index === -1) return [];

    const proof: string[] = [];
    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const currentLayer = this.layers[layerIndex];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < currentLayer.length) {
        proof.push(currentLayer[siblingIndex]);
      }
      index = Math.floor(index / 2);
    }
    return proof;
  }

  verify(address: string, proof: string[], root: string): boolean {
    let computed = hashVoter(address);
    for (const sibling of proof) {
      computed = combineHash(computed, sibling);
    }
    return computed.toLowerCase() === root.toLowerCase();
  }
}
