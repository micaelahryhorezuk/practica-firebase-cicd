"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { darmeDeBaja, misInscripciones, mensajeDeError, type Inscripcion } from "@/lib/sqlconnect";
import { useUsuario } from "@/lib/useUsuario";

export default function MisInscripciones() {
  const usuario = useUsuario();
  const [resultado, setResultado] = useState<{
    uid: string;
    items: Inscripcion[] | null;
    error: string | null;
  } | null>(null);
  const solicitud = useRef(0);
  const uid = usuario?.uid;

  const cargar = useCallback((id: string) => {
    const actual = ++solicitud.current;
    setResultado({ uid: id, items: null, error: null });
    misInscripciones()
      .then((items) => {
        if (solicitud.current === actual) setResultado({ uid: id, items, error: null });
      })
      .catch((e) => {
        if (solicitud.current === actual) setResultado({ uid: id, items: null, error: mensajeDeError(e) });
      });
  }, []);

  useEffect(() => {
    if (uid) cargar(uid);
    else {
      ++solicitud.current;
      setResultado(null);
    }
    return () => { ++solicitud.current; };
  }, [uid, cargar]);

  async function onBaja(cursoId: string) {
    if (!uid) return;
    const actual = solicitud.current;
    try {
      await darmeDeBaja(cursoId);
      if (solicitud.current === actual) cargar(uid);
    } catch (e) {
      if (solicitud.current === actual) {
        setResultado((prev) => prev?.uid === uid ? { ...prev, error: mensajeDeError(e) } : prev);
      }
    }
  }

  if (usuario === undefined) return <p className="hint">Verificando sesión…</p>;
  if (usuario === null) return <p className="hint">Ingresá con tu cuenta (arriba a la derecha) para ver tus inscripciones.</p>;
  // La respuesta anterior no debe pintarse ni durante el primer render de otra cuenta.
  const visible = resultado?.uid === usuario.uid ? resultado : null;
  const error = visible?.error;
  const items = visible?.items ?? null;
  if (error)
    return (
      <p className="alerta alerta--error" role="alert">
        {error}
      </p>
    );
  if (items === null) return <p className="hint">Cargando…</p>;
  if (items.length === 0)
    return (
      <p className="hint">
        Todavía no te inscribiste a ningún curso. <Link href="/cursos">Ver cursos →</Link>
      </p>
    );

  return (
    <ul className="grilla">
      {items.map((i) => (
        <li key={i.curso.id} className="card">
          <span className={`badge badge--${i.curso.nivel}`}>{i.curso.nivel}</span>
          <h2>{i.curso.titulo}</h2>
          <small>
            {i.curso.horas} horas · inscripto/a el {new Date(i.fecha).toLocaleDateString("es-AR")}
          </small>
          <div className="card__accion">
            <button type="button" className="button button--small button--ghost" onClick={() => onBaja(i.curso.id)}>
              Darme de baja
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
