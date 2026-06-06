import { CentralWorkHub } from './furniture/CentralWorkHub';
import { CoffeeLounge } from './furniture/CoffeeLounge';
import { MeetingZone } from './furniture/MeetingZone';
import { PrivateDesk } from './furniture/PrivateDesk';
import { Plant } from './furniture/Plants';
import { BACK_WALL_PLANTS } from '@/config/officePerimeterPlants';

export function OfficeLayout() {
  return (
    <group>
      <CentralWorkHub />
      <CoffeeLounge />
      <MeetingZone />
      <PrivateDesk />

      {BACK_WALL_PLANTS.map((plant, index) => (
        <Plant key={`back-wall-${index}`} position={plant.position} variant={plant.variant} />
      ))}

      <Plant position={[-5.85, 0, 4.25]} variant="fiddle" />
      <Plant position={[6.55, 0, 3.35]} variant="fiddle" />
      <Plant position={[2.6, 0, 4.1]} variant="medium" />
      <Plant position={[-1.6, 0, 3.6]} variant="small" />
      <Plant position={[-5.2, 0, -2.4]} variant="snake" />
      <Plant position={[5.8, 0, -1.8]} variant="snake" />
      <Plant position={[-3.2, 0, 4.5]} variant="tall" />
    </group>
  );
}
