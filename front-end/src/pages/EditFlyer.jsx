import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AddFlyerForm from "../components/AddFlyerForm";
import { useFlyers } from "../context/FlyersContext";

function EditFlyerPanel({ flyer }) {
  const location = useLocation();
  const { updateFlyer } = useFlyers();
  const [notice, setNotice] = useState(location.state?.notice ?? "");

  function handleSave(values) {
    updateFlyer(flyer.id, values);
    setNotice("Changes saved");
  }

  return (
    <AddFlyerForm
      heading="Edit Details"
      submitLabel="Save"
      initialValues={flyer}
      onSubmit={handleSave}
      notice={notice}
    />
  );
}

export default function EditFlyer() {
  const { flyerId } = useParams();
  const { getFlyer } = useFlyers();
  const flyer = getFlyer(flyerId);

  if (!flyer) {
    return (
      <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-8 pb-10 text-(--soft-black)">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <p className="body-copy">This flyer is not available.</p>
          <Link to="/home" className="body-copy underline underline-offset-4">
            Back to Main Feed
          </Link>
        </div>
      </section>
    );
  }

  return <EditFlyerPanel key={flyer.id} flyer={flyer} />;
}
