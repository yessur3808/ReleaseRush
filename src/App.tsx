import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components";
import { AboutPage, GamePage, GamesPage, HomeRedirect } from "./pages";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
