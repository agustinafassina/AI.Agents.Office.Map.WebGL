import { useMemo } from 'react';
import { resolveActiveOfficeZone } from '@/config/resolveActiveOfficeZone';
import type { OfficeZoneId } from '@/config/officeZones';
import { useSceneStore } from '@/stores/scene.store';

export function useActiveOfficeZone(): OfficeZoneId {
  const panOffset = useSceneStore((s) => s.panOffset);
  const zoomLevel = useSceneStore((s) => s.zoomLevel);
  const focusedZoneId = useSceneStore((s) => s.focusedZoneId);

  return useMemo(
    () => focusedZoneId ?? resolveActiveOfficeZone(panOffset, zoomLevel),
    [focusedZoneId, panOffset, zoomLevel],
  );
}
