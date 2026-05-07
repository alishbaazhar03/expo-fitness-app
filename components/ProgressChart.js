// components/ProgressChart.js
import { LineChart } from 'react-native-chart-kit';

export default function ProgressChart({ data }) {
  return (
    <LineChart
      data={data}
      width={Dimensions.get('window').width}
      height={220}
      chartConfig={chartConfig}
    />
  );
}