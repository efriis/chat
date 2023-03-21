const constants_keys = [
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SECRET_KEY",
  "OBSGEN_API_KEY",
] as const;

type Constants = {
  [K in typeof constants_keys[number]]: string;
};

const constants: Constants = constants_keys.reduce((acc, key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  acc[key] = process.env[key] as string;
  return acc;
}, {} as Constants);

export default constants;
