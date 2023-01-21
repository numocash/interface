import { ConnectButton as ConnectButtonRainbow } from "@rainbow-me/rainbowkit";

import { Button } from "../../common/Button";
import { HeaderItem } from "./Nav";

export const ConnectButton: React.FC = () => {
  return (
    <ConnectButtonRainbow.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <Button variant="primary" onClick={openConnectModal}>
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button variant="danger" onClick={openChainModal}>
                    Wrong network
                  </Button>
                );
              }

              return (
                <>
                  <button onClick={openChainModal}>
                    {chain.hasIcon && (
                      <HeaderItem
                        item={
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              overflow: "hidden",
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                style={{ width: 24, height: 24 }}
                              />
                            )}
                          </div>
                        }
                        label="Chain"
                      />
                    )}
                  </button>

                  <button onClick={openAccountModal}>
                    <HeaderItem
                      item={
                        <p tw="font-bold text-default">{account.displayName}</p>
                      }
                      label="Account"
                    />
                  </button>
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButtonRainbow.Custom>
  );
};
