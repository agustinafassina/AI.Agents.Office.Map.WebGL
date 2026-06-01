import { CentralWorkHub } from './furniture/CentralWorkHub';
import { CoffeeLounge } from './furniture/CoffeeLounge';
import { MeetingZone } from './furniture/MeetingZone';
import { PrivateDesk } from './furniture/PrivateDesk';
import { Plant } from './furniture/Plants';

export function OfficeLayout() {
  return (
    <group>
      <CentralWorkHub />
      <CoffeeLounge />
      <MeetingZone />
      <PrivateDesk />

      <Plant position={[-5.85, 0, 4.25]} variant="fiddle" />
      <Plant position={[6.55, 0, 3.35]} variant="fiddle" />
      <Plant position={[2.6, 0, 4.1]} variant="medium" />
      <Plant position={[-1.6, 0, 3.6]} variant="small" />
    </group>
  );
}
