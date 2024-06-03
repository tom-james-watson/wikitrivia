import React from "react";
import styles from "../styles/chart-bar.module.scss";
import { displayCO2 } from "../lib/items";

interface ChartBarProps {
  value: number,
  total: number
}

export default function ChartBar(props: ChartBarProps) {
  const {value, total} = props;
  let percent = value * 100 / total;
  let color = "red";
  if (value < 0) {
    percent = -percent;
    color = "green";
  }

  return (<div className={styles.chartBar}>
    <span className={styles.bar} style={{width: percent + "%", backgroundColor: color}}></span>
    <span>{displayCO2(value)}</span>
  </div>);
}