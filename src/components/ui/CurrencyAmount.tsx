import { formatCurrencyAmount } from '../../constants/currency';
import { useApp } from '../../context/AppContext';

interface CurrencyAmountProps {
  nairaAmount: number;
}

export function CurrencyAmount({ nairaAmount }: CurrencyAmountProps) {
  const { currency } = useApp();
  return <span className="cv">{formatCurrencyAmount(nairaAmount, currency)}</span>;
}
