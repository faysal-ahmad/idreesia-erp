# Rocket.Chat with the ERP's fixed policy baked in. Only settings that are the
# same in every environment live here; anything environment-specific (Mongo
# URL, ROOT_URL, CORS origins, file storage endpoint and credentials, admin
# seed) is passed in by docker-compose.yml.
#
# OVERWRITE_SETTING_* values are re-applied on every start, so changing them
# in the admin UI only lasts until the next restart.
FROM rocketchat/rocket.chat:8.9.1

ENV PORT=3000
EXPOSE 3000

# Every ERP user has a matching Rocket.Chat user, provisioned by the ERP.
# The ERP logs them in by minting a token for them
# (POST /api/v1/users.createToken), which this variable enables. Each call
# must also carry CREATE_TOKENS_FOR_USERS_SECRET, which differs per
# environment and so is set in docker-compose.yml / the App Platform env.
ENV CREATE_TOKENS_FOR_USERS=true

# Skip the setup wizard; the admin is seeded from ADMIN_* in the compose file.
ENV OVERWRITE_SETTING_Show_Setup_Wizard=completed

# Omnichannel (Livechat) backs the ERP Correspondence inbox.
#  - Reps are not always "online" as Rocket.Chat agents, so new chats must be
#    accepted (and queued) even when no agent is online - otherwise visitors
#    get `no-agent-online`.
#  - Chats wait in the queue until a rep takes one, rather than being
#    auto-assigned to whichever agent happens to be online.
ENV OVERWRITE_SETTING_Livechat_enabled=true \
    OVERWRITE_SETTING_Livechat_accept_chats_with_no_agents=true \
    OVERWRITE_SETTING_Livechat_Routing_Method=Manual_Selection

# The ERP is the only way in: no password login form, sign-up or password
# reset. Users arrive with a token minted by the ERP.
# The login form is off by default. The one-time setup needs it on (to sign
# in as admin and as the ERP service account); turn it on by setting
# OVERWRITE_SETTING_Accounts_ShowFormLogin in the compose file / App Platform
# env, which overrides the value here.
ENV OVERWRITE_SETTING_Accounts_ShowFormLogin=false \
    OVERWRITE_SETTING_Accounts_RegistrationForm=Disabled \
    OVERWRITE_SETTING_Accounts_PasswordReset=false

# ERP users may only have placeholder email addresses, so nothing may depend
# on email delivery.
ENV OVERWRITE_SETTING_Accounts_EmailVerification=false \
    OVERWRITE_SETTING_Accounts_TwoFactorAuthentication_By_Email_Auto_Opt_In=false \
    OVERWRITE_SETTING_Accounts_Send_Email_When_Activating=false \
    OVERWRITE_SETTING_Accounts_Send_Email_When_Deactivating=false

# Profiles are owned by the ERP sync; users can't change them here.
ENV OVERWRITE_SETTING_Accounts_AllowUsernameChange=false \
    OVERWRITE_SETTING_Accounts_AllowRealNameChange=false \
    OVERWRITE_SETTING_Accounts_AllowEmailChange=false \
    OVERWRITE_SETTING_Accounts_AllowPasswordChange=false \
    OVERWRITE_SETTING_Accounts_AllowDeleteOwnAccount=false
