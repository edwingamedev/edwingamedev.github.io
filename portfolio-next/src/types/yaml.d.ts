declare module "*.yml" {
  interface SkillGroup {
    category: string;
    icon: string;
    items: string[];
  }

  const value: SkillGroup[];
  export default value;
}
