/**
 * Bun 脚本跨平台路径（macOS / Windows / Linux）
 * 用 Bun 原生 import.meta.dir + path.join，避免手写 `/` 拼接。
 */
import { join } from 'path'

/** 工程根目录（scripts/ 的上一级） */
export function projectRoot(): string {
  return join(import.meta.dir, '..')
}

export function fromRoot(...segments: string[]): string {
  return join(projectRoot(), ...segments)
}

export { join }
