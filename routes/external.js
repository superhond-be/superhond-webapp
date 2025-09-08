import { Router } from "express";
import { saveRaw, upsertCustomer, upsertDog, addCredit } from "../services/store.js";
import { mapMailblueToDomain } from "../services/mapper.js";

const router = Router();

// Ontvangt body van de forwarder (source, receivedAt, storedFile, payload)
router.post("/mailblue", async (req, res) => {
  try {
    const { source, payload } = req.body || {};
    if (!payload) {
      return res.status(400).json({ ok: false, error: "payload ontbreekt" });
    }

    // Log ruwe inkomende data
    const rawPath = await saveRaw("mailblue", payload);

    // Map naar domein
    const domain = mapMailblueToDomain(payload);

    // Upsert klant
    const customer = await upsertCustomer(domain.customer);

    // (optioneel) Upsert hond indien aanwezig
    let dog = null;
    if (domain.dog) {
      dog = await upsertDog(customer.id, domain.dog);
    }

    // (optioneel) Credits toevoegen (b.v. bij voltooide betaling)
    if (domain.credit) {
      await addCredit(customer.id, domain.credit);
    }

    return res.status(200).json({
      ok: true,
      rawPath,
      customer,
      dog,
      creditAdded: Boolean(domain.credit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
