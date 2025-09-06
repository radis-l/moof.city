// Simple Hybrid Storage Routing
// Routes to the unified storage system

import * as unifiedStorage from './unified-storage'

// Re-export all functions from unified storage
export const saveFortuneData = unifiedStorage.saveFortuneData
export const checkEmailExists = unifiedStorage.checkEmailExists
export const getAllFortuneData = unifiedStorage.getAllFortuneData
export const deleteFortuneData = unifiedStorage.deleteFortuneData
export const clearAllFortuneData = unifiedStorage.clearAllFortuneData
export const exportToCSV = unifiedStorage.exportToCSV