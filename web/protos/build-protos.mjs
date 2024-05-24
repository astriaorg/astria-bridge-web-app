/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";

(async () => {
  try {
    const webAppSrcPath = path.join(__dirname, "..");

    const outDir = path.join(webAppSrcPath, "src/protos-generated");
    $.verbose = false;
    await $`mkdir -p ${outDir}`;
    $.verbose = true;

    const protoTsBinPath = path.join(webAppSrcPath, "node_modules/.bin/protoc-gen-ts_proto");

    const baseProtoPath = path.join(webAppSrcPath, "protos/proto");
    const thirdPartyProtoPath = path.join(webAppSrcPath, "protos/third_party/proto");

    const inputs = [
      "cosmos/authz/v1beta1/tx.proto",
      "cosmos/base/v1beta1/coin.proto",
      "cosmos/bank/v1beta1/bank.proto",
      "cosmos/bank/v1beta1/tx.proto",
      "cosmos/bank/v1beta1/authz.proto",
      "cosmos/staking/v1beta1/tx.proto",
      "cosmos/staking/v1beta1/authz.proto",
      "cosmos/gov/v1beta1/gov.proto",
      "cosmos/gov/v1beta1/tx.proto",
      "cosmos/distribution/v1beta1/tx.proto",
      "cosmos/crypto/multisig/v1beta1/multisig.proto",
      "cosmos/crypto/secp256k1/keys.proto",
      "cosmos/tx/v1beta1/tx.proto",
      "cosmos/tx/signing/v1beta1/signing.proto",
      "cosmos/base/abci/v1beta1/abci.proto",
      "cosmwasm/wasm/v1/tx.proto",
      "ibc/applications/transfer/v1/tx.proto",
      "osmosis/gamm/v1beta1/tx.proto",
      "osmosis/gamm/pool-models/balancer/tx/tx.proto",
      "osmosis/gamm/pool-models/stableswap/tx.proto",
    ];

    const thirdPartyInputs = ["tendermint/crypto/keys.proto"];

    await $`protoc \
      --plugin=${protoTsBinPath} \
      --ts_proto_opt=forceLong=string \
      --ts_proto_opt=esModuleInterop=true \
      --ts_proto_opt=outputClientImpl=false \
      --proto_path=${baseProtoPath} \
      --proto_path=${thirdPartyProtoPath} \
      --ts_proto_out=${outDir} \
      ${inputs.map((i) => path.join(baseProtoPath, i))} \
      ${thirdPartyInputs.map((i) => path.join(thirdPartyProtoPath, i))}`;

    $.verbose = false;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
