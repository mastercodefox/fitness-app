import { WorkoutSplit } from '../types/workout.types';
import { PeriodizationType } from '../types/cycle.types';
import { BaseSplitStrategy } from '../strategies/base/BaseSplitStrategy';
import { BasePeriodizationStrategy } from '../strategies/base/BasePeriodizationStrategy';

// Сплиты
import { FullBodySplit } from '../strategies/splits/FullBodySplit';
import { UpperLowerSplit } from '../strategies/splits/UpperLowerSplit';
import { PPLSplit } from '../strategies/splits/PPLSplit';
import { PushPullLegsSplit } from '../strategies/splits/PushPullLegsSplit';
import { BroSplit } from '../strategies/splits/BroSplit';

// Периодизации
import { LinearPeriodization } from '../strategies/periodization/LinearPeriodization';
import { UndulatingPeriodization } from '../strategies/periodization/UndulatingPeriodization';
import { BlockPeriodization } from '../strategies/periodization/BlockPeriodization';
import { ConjugatePeriodization } from '../strategies/periodization/ConjugatePeriodization';
import { AutoPeriodization } from '../strategies/periodization/AutoPeriodization';

export class StrategyFactory {
  
  static createSplitStrategy(split: WorkoutSplit): BaseSplitStrategy {
    switch (split) {
      case 'fullbody':
        return new FullBodySplit();
      case 'upperlower':
        return new UpperLowerSplit();
      case 'ppl':
        return new PPLSplit();
      case 'pushpulllegs':
        return new PushPullLegsSplit();
      case 'bro':
        return new BroSplit();
      default:
        throw new Error(`Unknown split: ${split}`);
    }
  }

  static createPeriodizationStrategy(type: PeriodizationType): BasePeriodizationStrategy {
    switch (type) {
      case 'linear':
        return new LinearPeriodization();
      case 'undulating':
        return new UndulatingPeriodization();
      case 'block':
        return new BlockPeriodization();
      case 'conjugate':
        return new ConjugatePeriodization();
      case 'auto':
        return new AutoPeriodization();
      default:
        throw new Error(`Unknown periodization type: ${type}`);
    }
  }
}