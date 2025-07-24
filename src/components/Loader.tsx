import React from "react";
import { useLoader } from "@/context/LoaderContext";
import styles from "@/styles/Loader.module.css";

const Loader: React.FC = () => {
  const { loading } = useLoader();

  if (!loading) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Loader;
