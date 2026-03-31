import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

const techniqueRows = [
  { name: 'energy_methods', description: 'using conservation of energy' },
  { name: 'force_decomposition', description: 'resolving forces into components' },
  { name: 'dimensional_analysis', description: 'checking relationships using units' },
  { name: 'order_of_magnitude', description: 'estimation and scaling' },
  { name: 'modelling_assumptions', description: 'simplifying physical systems' },
  { name: 'symmetry', description: 'exploiting symmetry' },
  { name: 'limiting_cases', description: 'analysing extreme conditions' },
  { name: 'method_selection', description: 'choosing optimal solving approach' },
  { name: 'momentum_methods', description: 'using momentum conservation' },
  { name: 'circular_motion', description: 'applying centripetal/rotational motion' }
] as const;

type TechniqueName = (typeof techniqueRows)[number]['name'];

type ProblemSeed = {
  id: number;
  statement: string;
  difficulty: number;
  primary: TechniqueName;
  secondary: TechniqueName[];
  answer: string;
  solution: string;
  keyInsight: string;
};

const problemRows: ProblemSeed[] = [
  {
    id: 1,
    statement:
      'A train travels at 200 km/h around a curve of radius 1500 m. The track is banked so that no lateral friction is required. Find the angle of banking.',
    difficulty: 3,
    primary: 'force_decomposition',
    secondary: ['circular_motion'],
    answer: '14.8°',
    solution:
      'Vertical: N cosθ = mg; Horizontal: N sinθ = mv²/r; tanθ = v²/(rg)',
    keyInsight: 'Resolve forces so centripetal acceleration comes entirely from the normal reaction.'
  },
  {
    id: 2,
    statement: 'A mass attached to a spring is compressed by distance x. Find the maximum speed.',
    difficulty: 2,
    primary: 'energy_methods',
    secondary: [],
    answer: '√(kx²/m)',
    solution: '1/2 kx² = 1/2 mv²; solve for v',
    keyInsight: 'Elastic potential energy fully converts into kinetic energy.'
  },
  {
    id: 3,
    statement: 'Estimate the number of air molecules in a classroom.',
    difficulty: 2,
    primary: 'order_of_magnitude',
    secondary: ['dimensional_analysis'],
    answer: '~10²⁶',
    solution: 'Classroom volume × air density ÷ molar mass × Avogadro’s number',
    keyInsight: 'Break complex problems into approximate, manageable steps.'
  },
  {
    id: 4,
    statement: 'At what angle is the range of a projectile maximised (ignoring air resistance)?',
    difficulty: 1,
    primary: 'symmetry',
    secondary: ['method_selection'],
    answer: '45°',
    solution: 'R = (v² sin2θ)/g, maximise sin2θ → θ=45°',
    keyInsight: 'Use symmetry to simplify projectile motion.'
  },
  {
    id: 5,
    statement: 'A ball falls from height h. Solve using energy and kinematics, compare methods.',
    difficulty: 2,
    primary: 'method_selection',
    secondary: ['energy_methods'],
    answer: '√(2gh)',
    solution: 'Energy: mgh=1/2 mv²; Kinematics: v² = u² + 2gh',
    keyInsight: 'Energy methods often avoid unnecessary variables.'
  },
  {
    id: 6,
    statement: 'Two masses, m1=3 kg and m2=5 kg, connected by a rope over a frictionless pulley. Find acceleration.',
    difficulty: 2,
    primary: 'force_decomposition',
    secondary: ['method_selection'],
    answer: '3.25 m/s²',
    solution: 'Tension T: m1 a = T - m1 g, m2 a = m2 g - T; solve',
    keyInsight: 'Apply Newton’s 2nd law to each mass separately.'
  },
  {
    id: 7,
    statement: 'A mass m oscillates on a spring with k=200 N/m. Find period.',
    difficulty: 2,
    primary: 'energy_methods',
    secondary: [],
    answer: 'T = 2π√(m/k)',
    solution: 'Use T = 2π√(m/k)',
    keyInsight: 'Energy and SHM formulas are interchangeable for period calculation.'
  },
  {
    id: 8,
    statement: 'A pendulum of length L is released from angle θ=30°. Find maximum speed at bottom.',
    difficulty: 3,
    primary: 'energy_methods',
    secondary: ['modelling_assumptions'],
    answer: '√(2gL(1−cosθ))',
    solution: 'mgh = 1/2 mv²; h=L(1−cosθ)',
    keyInsight: 'Convert vertical drop into energy.'
  },
  {
    id: 9,
    statement: 'Two masses, m1=2 kg, m2=3 kg. m1=5 m/s hits m2 at rest. Find final velocities (elastic).',
    difficulty: 3,
    primary: 'momentum_methods',
    secondary: ['energy_methods'],
    answer: 'v1=-1 m/s, v2=4 m/s',
    solution: 'Use momentum and kinetic energy conservation; solve system',
    keyInsight: 'Elastic collisions require both momentum and energy conservation.'
  },
  {
    id: 10,
    statement: 'Block slides down frictionless plane of height 5 m, angle 30°. Find final speed.',
    difficulty: 2,
    primary: 'energy_methods',
    secondary: ['force_decomposition'],
    answer: '9.9 m/s',
    solution: 'mgh = 1/2 mv²',
    keyInsight: 'Height determines speed regardless of incline angle (no friction).'
  },
  {
    id: 11,
    statement: 'Minimum speed for rollercoaster to stay in vertical loop of radius R?',
    difficulty: 3,
    primary: 'force_decomposition',
    secondary: ['energy_methods'],
    answer: '√(gR)',
    solution: 'At top, N ≥ 0 → mg - mv²/R ≥ 0 → v² = gR',
    keyInsight: 'Ensure centripetal force is sufficient for contact.'
  },
  {
    id: 12,
    statement: 'Force F=2x N acts on mass from x=0 to x=3 m. Find work.',
    difficulty: 3,
    primary: 'energy_methods',
    secondary: ['method_selection'],
    answer: '9 J',
    solution: 'W = ∫ F dx = ∫ 0→3 2x dx = 9 J',
    keyInsight: 'Integrate variable forces over displacement.'
  },
  {
    id: 13,
    statement: 'Determine if v² = gR could be dimensionally correct.',
    difficulty: 1,
    primary: 'dimensional_analysis',
    secondary: ['method_selection'],
    answer: 'Correct',
    solution: '[v²]=L²/T², [gR]=(L/T²)(L)=L²/T²',
    keyInsight: 'Units must match; simple sanity check.'
  },
  {
    id: 14,
    statement: 'Metal rod 1 m long, α=12×10⁻⁶ K⁻¹, ΔT=100°C. Find length change.',
    difficulty: 2,
    primary: 'modelling_assumptions',
    secondary: ['energy_methods'],
    answer: 'ΔL = 1.2 mm',
    solution: 'ΔL = α L ΔT',
    keyInsight: 'Small thermal expansion approximates linearly.'
  },
  {
    id: 15,
    statement: 'Estimate speed of sound in air using p=10⁵ Pa, ρ=1.2 kg/m³.',
    difficulty: 3,
    primary: 'order_of_magnitude',
    secondary: ['dimensional_analysis'],
    answer: '~290 m/s',
    solution: 'v = √(p/ρ)',
    keyInsight: 'Simplify complex physics into approximate constants.'
  },
  {
    id: 16,
    statement: 'A 4 m uniform beam, weight 200 N, pivoted at 1 m from left. Find force at right end to balance.',
    difficulty: 3,
    primary: 'force_decomposition',
    secondary: ['method_selection'],
    answer: '150 N',
    solution: 'Στ=0 → F × 3 = 200 × 1 → F=150 N',
    keyInsight: 'Torque balance simplifies equilibrium problems.'
  },
  {
    id: 17,
    statement: 'Solid cylinder (I=½ MR²) rolls down slope height h. Find v at bottom.',
    difficulty: 3,
    primary: 'energy_methods',
    secondary: ['circular_motion'],
    answer: '√(4gh/3)',
    solution: 'mgh = 1/2 mv² + 1/2 Iω² = 1/2 mv² + 1/4 mv² → v² = 4/3 gh',
    keyInsight: 'Include rotational energy in total energy.'
  },
  {
    id: 18,
    statement: 'RC circuit with R=1 kΩ, C=2 μF. Time to reach 63% voltage?',
    difficulty: 2,
    primary: 'method_selection',
    secondary: ['modelling_assumptions'],
    answer: 'τ = RC = 2 ms',
    solution: 'Exponential charging: V = V₀(1 − e^−t/RC) → t = RC at 63%',
    keyInsight: 'Use standard exponential time constant formula.'
  },
  {
    id: 19,
    statement: 'Wire length L=0.5 m, I=2 A, B=0.3 T perpendicular. Find force.',
    difficulty: 2,
    primary: 'force_decomposition',
    secondary: [],
    answer: '0.3 N',
    solution: 'F=IL×B',
    keyInsight: 'Perpendicular wires maximize force.'
  },
  {
    id: 20,
    statement: 'String length L, fixed ends, wavelength of 3rd harmonic?',
    difficulty: 2,
    primary: 'method_selection',
    secondary: ['symmetry'],
    answer: '2L/3',
    solution: 'λ_n = 2L/n',
    keyInsight: 'Fixed-end harmonics → λ = 2L/n'
  },
  {
    id: 21,
    statement: 'Metal block, ΔT=50°C, c=400 J/kg·K, m=2 kg. Find heat added.',
    difficulty: 1,
    primary: 'energy_methods',
    secondary: [],
    answer: 'Q = 40000 J',
    solution: 'Q = mcΔT',
    keyInsight: 'Heat capacity links temperature change to energy.'
  },
  {
    id: 22,
    statement: 'Launch speed 20 m/s, θ=30°. Find maximum height.',
    difficulty: 2,
    primary: 'energy_methods',
    secondary: ['force_decomposition'],
    answer: '5 m',
    solution: 'v_y = v sinθ, H = v_y²/(2g)',
    keyInsight: 'Vertical motion independent of horizontal.'
  },
  {
    id: 23,
    statement: 'Block volume 0.01 m³, density 500 kg/m³, water density 1000 kg/m³. Find submerged volume.',
    difficulty: 2,
    primary: 'method_selection',
    secondary: ['modelling_assumptions'],
    answer: '0.005 m³',
    solution: 'ρ_block V = ρ_water V_sub → V_sub = 0.5 V',
    keyInsight: 'Archimedes’ principle determines displacement.'
  },
  {
    id: 24,
    statement: 'Mass 0.5 kg, k=200 N/m, amplitude 0.1 m. Find max acceleration.',
    difficulty: 2,
    primary: 'energy_methods',
    secondary: ['method_selection'],
    answer: '≈40 m/s²',
    solution: 'ω=√(k/m), a_max=ω²A',
    keyInsight: 'Maximum acceleration occurs at amplitude extremes.'
  },
  {
    id: 25,
    statement: 'μ=0.2, θ=30°, m=10 kg. Find acceleration down plane.',
    difficulty: 3,
    primary: 'force_decomposition',
    secondary: ['method_selection'],
    answer: '≈3.8 m/s²',
    solution: 'a=g(sinθ−μcosθ)',
    keyInsight: 'Include friction in decomposition along slope.'
  },
  {
    id: 26,
    statement: 'Satellite in circular orbit r=7000 km from Earth center. Find speed.',
    difficulty: 3,
    primary: 'force_decomposition',
    secondary: ['energy_methods'],
    answer: '≈7.5 km/s',
    solution: 'GMm/r²=mv²/r → v=√(GM/r)',
    keyInsight: 'Circular orbit speed depends only on radius.'
  },
  {
    id: 27,
    statement: '2 kg mass slides down slope with friction, loses 50 J to heat. Find final speed from 5 m height.',
    difficulty: 3,
    primary: 'energy_methods',
    secondary: ['modelling_assumptions'],
    answer: '≈8.7 m/s',
    solution: 'mgh−W_friction = 1/2 mv² → solve',
    keyInsight: 'Energy lost to friction reduces kinetic energy.'
  },
  {
    id: 28,
    statement: 'Two ice skaters push off. m1=50 kg, v1=1 m/s. m2=70 kg. Find v2.',
    difficulty: 3,
    primary: 'momentum_methods',
    secondary: ['force_decomposition'],
    answer: 'v2=0.714 m/s opposite',
    solution: 'm1v1 + m2v2 = 0 → v2 = −m1v1/m2',
    keyInsight: 'Momentum conserved even in 2D or isolated system.'
  },
  {
    id: 29,
    statement: 'Light from air to glass n=1.5, θ_incident=30°. Find θ_refracted.',
    difficulty: 2,
    primary: 'method_selection',
    secondary: ['symmetry'],
    answer: '≈19.5°',
    solution: 'Snell’s law: n1 sinθ1 = n2 sinθ2 → θ2 = arcsin(1 × sin30 /1.5)',
    keyInsight: 'Apply Snell’s law for refraction angles.'
  },
  {
    id: 30,
    statement: 'Car on banked track, μ=0.1, v=20 m/s, r=50 m. Find angle θ for no slip.',
    difficulty: 4,
    primary: 'force_decomposition',
    secondary: ['method_selection'],
    answer: '≈23°',
    solution: 'tanθ = v²/(rg) − μ',
    keyInsight: 'Friction modifies ideal banking angle.'
  }
];

async function main() {
  for (const technique of techniqueRows) {
    await prisma.technique.upsert({
      where: { name: technique.name },
      update: technique,
      create: technique
    });
  }

  const techniques = await prisma.technique.findMany();
  const techniqueMap = Object.fromEntries(techniques.map((item) => [item.name, item.id])) as Record<TechniqueName, number>;

  for (const problem of problemRows) {
    await prisma.problem.upsert({
      where: { id: problem.id },
      update: {
        statement: problem.statement,
        difficulty: problem.difficulty,
        primaryTechniqueId: techniqueMap[problem.primary],
        secondaryTechniqueIds: problem.secondary.map((name) => techniqueMap[name]),
        answer: problem.answer,
        solution: problem.solution,
        keyInsight: problem.keyInsight
      },
      create: {
        id: problem.id,
        statement: problem.statement,
        difficulty: problem.difficulty,
        primaryTechniqueId: techniqueMap[problem.primary],
        secondaryTechniqueIds: problem.secondary.map((name) => techniqueMap[name]),
        answer: problem.answer,
        solution: problem.solution,
        keyInsight: problem.keyInsight
      }
    });
  }

  const defaultUser = await prisma.user.upsert({
    where: { email: 'demo@trainer.com' },
    update: {},
    create: {
      email: 'demo@trainer.com',
      passwordHash: createHash('sha256').update('demo123').digest('hex')
    }
  });

  for (const technique of techniques) {
    await prisma.userTechnique.upsert({
      where: { userId_techniqueId: { userId: defaultUser.id, techniqueId: technique.id } },
      update: {},
      create: { userId: defaultUser.id, techniqueId: technique.id }
    });
  }

  console.log(`Seed complete: ${techniqueRows.length} techniques, ${problemRows.length} problems`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
