import ObsGenClient from "obsgen";
import constants from "./constants";

const obsgenClient = new ObsGenClient(constants.OBSGEN_API_KEY);

export default obsgenClient;
