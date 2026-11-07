import { useState } from "react";
import { useNavigate } from "react-router-dom";
import arrowBack from "../assets/arrow-back-40px.svg";
import { clubs } from "../data/clubs";

const emptyFlyer = {
  image: "",
  title: "",
  clubId: "",
  date: "",
  time: "",
  location: "",
};

const inputClass =
  "mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--nyu-indigo)";
const labelClass = "body-copy text-sm font-medium";

// Shared by Add Flyer and Edit Flyer: the wireframes use the same form for both.
export default function AddFlyerForm({ heading, submitLabel, initialValues = emptyFlyer, onSubmit, notice }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ ...emptyFlyer, ...initialValues });
  const [imageError, setImageError] = useState("");

  function goBack() {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    navigate("/home");
  }

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setField("image", URL.createObjectURL(file));
    setImageError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!values.image) {
      setImageError("Please upload a flyer image.");
      return;
    }
    onSubmit(values);
  }

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-6 pb-8 text-(--soft-black)">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between gap-3">
          <h1 className="heading">{heading}</h1>
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
          >
            <img src={arrowBack} alt="" className="size-8 brightness-0" />
          </button>
        </div>

        {notice && (
          <p
            role="status"
            className="body-copy mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-(--nyu-indigo) shadow-sm ring-1 ring-black/5"
          >
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label
              className={`flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-white text-center shadow-sm focus-within:ring-2 focus-within:ring-(--nyu-indigo) ${
                imageError ? "border-red-700/60" : "border-black/15"
              } ${values.image ? "p-2" : "h-40"}`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
              {values.image ? (
                <>
                  <img
                    src={values.image}
                    alt="Flyer preview"
                    className="max-h-80 w-full rounded-xl bg-(--paper) object-contain"
                  />
                  <span className="body-copy py-2 text-sm underline underline-offset-4">
                    Change image
                  </span>
                </>
              ) : (
                <span className="body-copy font-semibold">Upload Image*</span>
              )}
            </label>
            {imageError && (
              <p role="alert" className="body-copy mt-1.5 text-sm text-red-700">
                {imageError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="flyer-title" className={labelClass}>Title*</label>
            <input
              id="flyer-title"
              type="text"
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Event name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="flyer-club" className={labelClass}>Club*</label>
            <select
              id="flyer-club"
              value={values.clubId}
              onChange={(e) => setField("clubId", e.target.value)}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Choose a club
              </option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="flyer-date" className={labelClass}>Date*</label>
              <input
                id="flyer-date"
                type="date"
                value={values.date}
                onChange={(e) => setField("date", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="flyer-time" className={labelClass}>Time*</label>
              <input
                id="flyer-time"
                type="time"
                value={values.time}
                onChange={(e) => setField("time", e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="flyer-location" className={labelClass}>Location*</label>
            <input
              id="flyer-location"
              type="text"
              value={values.location}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="Begin typing an address..."
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            className="body-copy mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
