<script>
    import { onMount, getContext } from 'svelte';
    
    //Components
    import { Components }  from '../Router.svelte';
    const { Loading } = Components;

    //Context
    const { appHome } = getContext('app_functions');
    const { deleteCoin, setPage, setResult } = getContext('coinmodify_functions');

    //Props
    export let coin;
    const buttons = [
        {id: 'home-btn', name: 'Home', click: () => appHome(), class: 'button__solid button__purple'}
    ]

    const successResult= {
        title: 'Account Deleted',
        subtitle: `${coin.nickname} - ${coin.name} ${coin.symbol} Account deleted successfully`,
        message: "Successful Deletion",
        type: 'success',
        buttons
    }

    const failedResult= {
        title: 'Delete Failed',
        subtitle: `${coin.nickname} - ${coin.name} ${coin.symbol} Account failed to delete`,
        message: "Something went wrong while removing this Account",
        type: 'error',
        buttons
    }

    onMount(() => {
        new Promise(function(resolve, reject) {
            deleteCoin(resolve)
        })
        .then(res => {
            setResult(res ? successResult : failedResult)
            setPage(5)
        })
        .catch(err => {
            setResult(failedResult)
            setPage(5)  
        })
    })
</script>

<style>
.deleting-coin{
    height: 224px;
    justify-content: center;
    align-items: center;
}
</style>

<div class="deleting-coin flex-column">
    <h2>Deleting Account from Wallet</h2>
    <Loading />
</div>