class Kubelogin < Formula
  desc "A kubectl plugin for Kubernetes OpenID Connect authentication"
  homepage "https://github.com/int128/kubelogin"
  version "v1.24.0"

  on_macos do
    url "https://github.com/int128/kubelogin/releases/download/v1.24.0/kubelogin_darwin_amd64.zip"
    sha256 "7bb080e2bd3928ae0cd275baede6e1fcc4a1e8252d15598254cda609cb0095f3"
  end
  on_linux do
    url "https://github.com/int128/kubelogin/releases/download/v1.24.0/kubelogin_linux_amd64.zip"
    sha256 "658499b338b8cee7c622130d68405a55b4c4051ba43f7c841cb3f3d9364b3292"
  end

  def install
    bin.install "kubelogin" => "kubelogin"
    ln_s bin/"kubelogin", bin/"kubectl-oidc_login"
  end

  test do
    system "#{bin}/kubelogin -h"
    system "#{bin}/kubectl-oidc_login -h"
  end
end
