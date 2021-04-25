import React from "react";
import Loader from "react-loader-spinner";
import styles from "../styles/loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.loading}>
      <h1>Loading</h1>
      <Loader type="Oval" color="#ffffff" height={80} width={80} />
    </div>
  );
}
