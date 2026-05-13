/**
 * Demo seed — 24 IGCSE Biology flashcards (8 easy, 8 medium, 8 hard).
 * Run: npx tsx prisma/demo.ts
 * Requires the main seed to have run first (npx prisma db seed).
 */
import { PrismaClient, type Difficulty } from "@prisma/client"

const prisma = new PrismaClient()

type Card = {
  difficulty: Difficulty
  question: string
  answer: string
  explanation: string | null
}

const CARDS: Card[] = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  {
    difficulty: "EASY",
    question: "What is photosynthesis?",
    answer:
      "The process by which plants use light energy, water, and carbon dioxide to produce glucose and oxygen.",
    explanation:
      "It occurs mainly in the leaves, inside organelles called chloroplasts that contain chlorophyll.",
  },
  {
    difficulty: "EASY",
    question: "What is the role of the cell membrane?",
    answer:
      "It controls what enters and leaves the cell — it is selectively (partially) permeable.",
    explanation:
      "Small molecules like oxygen and water can pass freely; larger or charged molecules need protein channels or carriers.",
  },
  {
    difficulty: "EASY",
    question: "What is osmosis?",
    answer:
      "The net movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane.",
    explanation:
      "Osmosis is a special case of diffusion — only water molecules move, and no energy (ATP) is needed.",
  },
  {
    difficulty: "EASY",
    question: "What is diffusion?",
    answer:
      "The net movement of particles from a region of high concentration to low concentration, down a concentration gradient.",
    explanation: "Diffusion is a passive process — it does not require energy.",
  },
  {
    difficulty: "EASY",
    question: "Name the organelle where aerobic respiration occurs.",
    answer: "Mitochondria — they produce ATP (energy currency) for the cell.",
    explanation:
      "Cells with high energy demands (e.g. muscle cells) contain many more mitochondria than less active cells.",
  },
  {
    difficulty: "EASY",
    question: "What does the nucleus of a cell do?",
    answer:
      "It controls cell activities and contains DNA, which carries the genetic instructions for making proteins.",
    explanation:
      "The nucleus is bounded by a double membrane (nuclear envelope) with pores that allow mRNA to exit.",
  },
  {
    difficulty: "EASY",
    question: "What gas do plants absorb during photosynthesis?",
    answer: "Carbon dioxide (CO₂), absorbed through tiny pores in the leaf called stomata.",
    explanation:
      "CO₂ enters by diffusion when the stomata are open, which also lets water vapour out (transpiration).",
  },
  {
    difficulty: "EASY",
    question: "What are the two types of cell division in the human body?",
    answer:
      "Mitosis (for growth, repair, and asexual reproduction) and meiosis (to produce gametes/sex cells).",
    explanation:
      "Mitosis produces 2 identical diploid cells; meiosis produces 4 genetically different haploid cells.",
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    difficulty: "MEDIUM",
    question: "Write the word equation for aerobic respiration.",
    answer: "Glucose + oxygen → carbon dioxide + water (+ energy released as ATP).",
    explanation:
      "Aerobic respiration is far more efficient than anaerobic, yielding ~38 ATP molecules per glucose.",
  },
  {
    difficulty: "MEDIUM",
    question:
      "How does the structure of a red blood cell suit its function?",
    answer:
      "No nucleus (more room for haemoglobin), biconcave disc shape (large surface area for gas exchange), small and flexible (squeezes through narrow capillaries).",
    explanation:
      "Red blood cells also lack mitochondria — they respire anaerobically so they don't use the oxygen they carry.",
  },
  {
    difficulty: "MEDIUM",
    question:
      "What is the difference between aerobic and anaerobic respiration?",
    answer:
      "Aerobic uses oxygen, releases more energy (~38 ATP), produces CO₂ and water. Anaerobic requires no oxygen, releases less energy (~2 ATP), produces lactic acid (in animal cells) or ethanol and CO₂ (in yeast/plant cells).",
    explanation:
      "After anaerobic exercise, lactic acid builds up and must be broken down — this is the 'oxygen debt'.",
  },
  {
    difficulty: "MEDIUM",
    question: "Describe how enzymes work using the lock and key model.",
    answer:
      "The substrate has a complementary shape to the enzyme's active site. They bind to form an enzyme-substrate complex. The reaction occurs, products are released, and the enzyme is unchanged and ready to be reused.",
    explanation:
      "The induced fit model refines this — the active site flexes slightly to fit the substrate more precisely.",
  },
  {
    difficulty: "MEDIUM",
    question:
      "What are the main structural differences between plant and animal cells?",
    answer:
      "Plant cells have a rigid cell wall (cellulose), chloroplasts, and a large central vacuole. Animal cells lack all three but have centrioles (for cell division) and are more irregular in shape.",
    explanation:
      "Both cell types have a nucleus, cell membrane, cytoplasm, mitochondria, and ribosomes.",
  },
  {
    difficulty: "MEDIUM",
    question: "What is the function of haemoglobin?",
    answer:
      "A protein in red blood cells that binds oxygen in the lungs (forming oxyhaemoglobin) and releases it to body tissues that require it.",
    explanation:
      "Haemoglobin's affinity for oxygen is influenced by CO₂ concentration — higher CO₂ causes it to release oxygen more readily (Bohr effect).",
  },
  {
    difficulty: "MEDIUM",
    question: "What is natural selection?",
    answer:
      "Individuals with advantageous traits are more likely to survive, reproduce, and pass those traits to offspring, gradually changing allele frequencies in a population over generations.",
    explanation:
      "Natural selection acts on phenotype (the physical trait), but it is the underlying genotype (alleles) that is inherited.",
  },
  {
    difficulty: "MEDIUM",
    question:
      "How does the leaf structure adapt the plant for photosynthesis?",
    answer:
      "Broad, flat shape (large surface area); thin (short diffusion distance for CO₂ and light); transparent epidermis (lets light through); palisade cells packed with chloroplasts; stomata allow gas exchange; xylem delivers water.",
    explanation:
      "The spongy mesophyll has air spaces to increase the surface area available for gas exchange inside the leaf.",
  },

  // ── HARD ──────────────────────────────────────────────────────────────────
  {
    difficulty: "HARD",
    question:
      "Explain how the nervous system coordinates a reflex action, naming each component in the reflex arc.",
    answer:
      "Receptor detects stimulus → sensory neurone carries impulse to spinal cord → relay neurone in the CNS connects to → motor neurone → effector (muscle or gland) responds. The pathway bypasses the brain, producing a fast, involuntary response.",
    explanation:
      "Synapses between neurones use chemical neurotransmitters (e.g. acetylcholine) that diffuse across the synaptic cleft to trigger the next impulse.",
  },
  {
    difficulty: "HARD",
    question:
      "Describe how blood glucose concentration is regulated after a carbohydrate-rich meal.",
    answer:
      "Rising blood glucose is detected by beta cells in the islets of Langerhans (pancreas) → insulin is secreted → liver and muscle cells absorb glucose and convert it to glycogen (glycogenesis) → blood glucose falls back to the set point. This is negative feedback.",
    explanation:
      "When blood glucose falls too low, alpha cells secrete glucagon, which triggers glycogenolysis (glycogen → glucose), restoring levels.",
  },
  {
    difficulty: "HARD",
    question: "Outline the two stages of protein synthesis.",
    answer:
      "(1) Transcription: in the nucleus, DNA unwinds; mRNA is assembled complementary to the template strand (A→U, T→A, G→C, C→G); mRNA exits through nuclear pores. (2) Translation: mRNA binds to a ribosome; tRNA molecules carry specific amino acids whose anticodon matches each mRNA codon; amino acids are joined by peptide bonds to form a polypeptide chain.",
    explanation:
      "Every three bases (a codon) on mRNA codes for one amino acid. There are 64 possible codons for 20 amino acids, so most amino acids have more than one codon (degeneracy).",
  },
  {
    difficulty: "HARD",
    question:
      "How do the kidneys produce urine through ultrafiltration and selective reabsorption?",
    answer:
      "High blood pressure in the glomerulus forces small molecules (water, glucose, urea, salts) into the Bowman's capsule (ultrafiltration). As filtrate travels along the tubules, all glucose, most water, and useful salts are actively or passively reabsorbed back into the blood. The remaining fluid (urea, some water and salts) becomes urine, which drains to the ureter.",
    explanation:
      "The loop of Henlé creates a concentration gradient in the medulla that drives water reabsorption. ADH controls the permeability of the collecting duct, regulating how concentrated the urine is.",
  },
  {
    difficulty: "HARD",
    question: "Describe the process of meiosis and explain why it is important.",
    answer:
      "Meiosis I: homologous chromosome pairs are separated (halving chromosome number, 2n→n). Meiosis II: sister chromatids separate (like mitosis). Result: 4 haploid gametes, each genetically unique due to independent assortment and crossing over during prophase I.",
    explanation:
      "Crossing over — where non-sister chromatids exchange segments — shuffles alleles and is a major source of genetic variation, vital for evolution.",
  },
  {
    difficulty: "HARD",
    question:
      "Explain the mechanism of active transport and state when it is necessary.",
    answer:
      "Active transport moves molecules against a concentration gradient (low → high) using carrier proteins and energy from ATP hydrolysis. It is used when cells need substances that cannot be obtained by diffusion alone, e.g. glucose and ions absorbed in the gut; nitrate ions absorbed by root hair cells from the soil.",
    explanation:
      "Because it requires ATP, active transport is inhibited by metabolic poisons (e.g. cyanide) that block respiration.",
  },
  {
    difficulty: "HARD",
    question: "How does the immune system respond to a new bacterial infection?",
    answer:
      "Phagocytes engulf and destroy bacteria (phagocytosis). Lymphocytes with complementary antibody receptors detect bacterial antigens → B-lymphocytes proliferate and secrete specific antibodies that bind and neutralise pathogens → T-lymphocytes coordinate and attack infected cells. Memory cells persist for a faster secondary response.",
    explanation:
      "Vaccination introduces harmless antigens (dead/weakened pathogens or their proteins) so memory cells are generated without causing disease.",
  },
  {
    difficulty: "HARD",
    question:
      "Explain two mechanisms by which the human body maintains a stable core temperature (thermoregulation).",
    answer:
      "Detected by thermoreceptors in the skin and hypothalamus. (1) If too hot: blood vessels in skin dilate (vasodilation) → more heat lost by radiation; sweat glands secrete sweat → evaporation removes heat. (2) If too cold: blood vessels constrict (vasoconstriction) → less heat lost; skeletal muscles shiver (rapid contractions generate heat); hairs erect to trap air (less effective in humans).",
    explanation:
      "The hypothalamus acts as the body's thermostat — it sends nerve signals and triggers hormone release to restore the set point (~37 °C). This is a classic example of negative feedback.",
  },
]

async function main() {
  const biology = await prisma.subject.findFirst({ where: { code: "0610" } })
  if (!biology) {
    throw new Error(
      "Biology subject not found. Run `npx prisma db seed` first to populate subjects."
    )
  }

  const existing = await prisma.flashcard.count({ where: { subjectId: biology.id } })
  if (existing > 0) {
    console.log(`Biology already has ${existing} flashcards — skipping demo seed.`)
    return
  }

  await prisma.flashcard.createMany({
    data: CARDS.map((c) => ({ ...c, subjectId: biology.id })),
  })

  console.log(`✓ Created ${CARDS.length} demo IGCSE Biology flashcards.`)
  console.log("  8 Easy  |  8 Medium  |  8 Hard")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
